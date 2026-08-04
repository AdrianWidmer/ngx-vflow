/**
 * macOS reports a trackpad pinch as a handful of px per frame where other platforms
 * report ~100, so the same gesture needs a multiplier to feel equally responsive.
 */
const MAC_PINCH_BOOST = 10;

export const isMacPlatform = (): boolean =>
  typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.userAgent);

/**
 * Normalizes a wheel event into the delta d3-zoom expects, where scale is applied as
 * `k *= 2^delta`.
 *
 * Raw deltaY for the *same* physical gesture differs wildly across platforms: a macOS
 * trackpad pinch reports ~1-5px per frame, a Windows/Linux touchpad pinch or a mouse
 * notch reports ~100px, Firefox reports lines, and some setups report whole pages. With
 * d3's default delta this means zoom crawls on macOS and crosses the entire scale extent
 * in two frames on Windows/Linux.
 *
 * So: boost the tiny macOS pinch deltas, then clamp every step to `zoomStep` (a fraction
 * of current zoom, e.g. 0.07 = at most 7% per event).
 */
export function wheelDelta(event: WheelEvent, zoomStep: number, isMac = isMacPlatform()): number {
  // deltaMode 0 = px, 1 = lines, 2 = pages
  const perUnit = event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002;
  const boost = event.ctrlKey && isMac ? MAC_PINCH_BOOST : 1;
  const delta = -event.deltaY * perUnit * boost;

  const max = Math.log2(1 + zoomStep);

  return Math.max(-max, Math.min(max, delta));
}
