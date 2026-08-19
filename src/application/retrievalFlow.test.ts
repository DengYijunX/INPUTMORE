import { describe, expect, it, vi } from 'vitest';
import { runRetrievalFlow, type RetrievalRunner } from './retrievalFlow';

describe('runRetrievalFlow', () => {
  it('trims the query before passing it to retrieval', async () => {
    const runner: RetrievalRunner = {
      retrieve: vi.fn().mockResolvedValue({ answer: '答案', sources: [] }),
    };

    await expect(runRetrievalFlow('  查询内容  ', runner)).resolves.toEqual({ answer: '答案', sources: [] });
    expect(runner.retrieve).toHaveBeenCalledWith('查询内容', undefined);
  });

  it('forwards cancellation to the retrieval runner', async () => {
    const runner: RetrievalRunner = {
      retrieve: vi.fn().mockResolvedValue({ answer: '答案', sources: [] }),
    };
    const controller = new AbortController();

    await runRetrievalFlow('查询', runner, controller.signal);

    expect(runner.retrieve).toHaveBeenCalledWith('查询', controller.signal);
  });

  it('rejects an empty query before calling the runner', async () => {
    const runner: RetrievalRunner = {
      retrieve: vi.fn(),
    };

    await expect(runRetrievalFlow('  ', runner)).rejects.toThrow('检索内容不能为空');
    expect(runner.retrieve).not.toHaveBeenCalled();
  });
});
