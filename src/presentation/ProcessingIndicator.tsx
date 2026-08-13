export function ProcessingIndicator() {
  return (
    <span className="processing-indicator" aria-label="正在处理，请稍候">
      <span className="processing-dots" data-testid="processing-dots" aria-hidden="true"><i /><i /><i /></span>
    </span>
  );
}
