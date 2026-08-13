import './App.css';
import { useEffect, useState } from 'react';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';

export function PreviewPage() {
  const [text, setText] = useState(() => localStorage.getItem('inputmore.preview.text') ?? '');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void listen<{ text: string }>('inputmore://preview', (event) => {
      localStorage.setItem('inputmore.preview.text', event.payload.text);
      setText(event.payload.text);
    }).then((unlisten) => { cleanup = unlisten; });
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    void getCurrentWindow().setSize(new LogicalSize(420, expanded ? 220 : 108));
  }, [expanded]);

  return <main className={`preview-window${expanded ? ' is-expanded' : ''}`}>
    <button className="preview-window-header" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
      <span>整理结果</span><span>{expanded ? '收起⌃' : '展开⌄'}</span>
    </button>
    <p className="preview-window-text">{expanded ? text : `${text.slice(0, 34)}${text.length > 34 ? '…' : ''}`}</p>
    {expanded && <p className="preview-window-hint">文本已整理，当前版本尚未写回输入框</p>}
  </main>;
}
