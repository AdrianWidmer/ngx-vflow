import { isTouchEvent } from './event';

/**
 * Runs `start` once the pointer has traveled `distance` px from the press point
 * (mirrors d3-drag clickDistance semantics). Release before the threshold → `start`
 * never runs and the native click fires untouched. distance <= 0 → starts synchronously
 * (exact legacy behavior). After a deferred start, the click that follows pointerup is
 * suppressed (same trick d3-drag uses), so a connection drag never doubles as a click.
 */
export function deferPointerStart(event: Event, distance: number, start: () => void): void {
  if (distance <= 0) {
    start();
    return;
  }

  const src = isTouchEvent(event) ? event.touches[0] : (event as MouseEvent);
  const origin = { x: src.clientX, y: src.clientY };
  const abort = new AbortController();

  document.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) < distance) {
        return;
      }

      abort.abort();
      start();

      const suppressClick = (c: Event) => c.stopPropagation();
      window.addEventListener('click', suppressClick, { capture: true });
      // click fires right after pointerup — remove the suppressor a tick later so a
      // drag that produces no click can't swallow an unrelated future click
      document.addEventListener(
        'pointerup',
        () => setTimeout(() => window.removeEventListener('click', suppressClick, { capture: true })),
        { once: true },
      );
    },
    { signal: abort.signal },
  );

  document.addEventListener('pointerup', () => abort.abort(), { once: true, signal: abort.signal });
}
