export type TextInputKeyEvent = Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey'>;

export function shouldSubmitTextInput(event: TextInputKeyEvent): boolean {
  return event.key === 'Enter' && (event.ctrlKey || event.metaKey);
}
