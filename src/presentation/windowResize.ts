export function getFloatingWindowHeight(cardHeight: number, documentHeight: number, minHeight = 90, padding = 20) {
  const measuredHeight = Math.max(0, cardHeight + padding, documentHeight);
  return Math.max(minHeight, Math.ceil(measuredHeight));
}
