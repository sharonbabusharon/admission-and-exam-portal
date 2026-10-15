// Keep keyboard navigation inside a dialog and return focus to its trigger.
export function dialog(node, close) {
  const previous = document.activeElement;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const controls = () => [...node.querySelectorAll('button:not(:disabled), input:not(:disabled), select, textarea, a[href]')].filter(el => el.getClientRects().length);
  const initial = node.querySelector('input') || controls()[0];
  initial?.focus({ preventScroll: true });
  function keydown(event) {
    if (event.key === 'Escape') { event.stopPropagation(); close?.(); }
    if (event.key !== 'Tab') return;
    const elements = controls(), first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  node.addEventListener('keydown', keydown);
  return { destroy() {
    node.removeEventListener('keydown', keydown);
    document.body.style.overflow = previousOverflow;
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  } };
}
