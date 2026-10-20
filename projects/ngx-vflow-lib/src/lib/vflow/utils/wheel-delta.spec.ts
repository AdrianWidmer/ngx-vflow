import { isMouseWheel, wheelDelta } from './wheel-delta';

// d3-zoom applies k *= 2^delta, so this is the zoom factor a delta produces
const factor = (delta: number) => 2 ** delta;

// wheelDeltaY is non-standard and not settable through WheelEventInit
const chromeWheel = (deltaY: number, notches: number) => {
  const event = new WheelEvent('wheel', { deltaY });
  Object.defineProperty(event, 'wheelDeltaY', { value: -Math.sign(deltaY) * notches });

  return event;
};

describe('isMouseWheel', () => {
  it('detects a mouse wheel', () => {
    expect(isMouseWheel(chromeWheel(4.000244140625, 120)))
      .withContext('macOS Chrome notch')
      .toBeTrue();
    expect(isMouseWheel(chromeWheel(100, 120)))
      .withContext('Windows notch')
      .toBeTrue();
    expect(isMouseWheel(chromeWheel(200, 240)))
      .withContext('two notches')
      .toBeTrue();
    expect(isMouseWheel(new WheelEvent('wheel', { deltaY: 3, deltaMode: 1 })))
      .withContext('Firefox')
      .toBeTrue();
  });

  it('detects a trackpad', () => {
    expect(isMouseWheel(chromeWheel(7, 21)))
      .withContext('small swipe')
      .toBeFalse();
    // wheelDeltaY -3 × deltaY happens to be a multiple of 120
    expect(isMouseWheel(chromeWheel(40, 120)))
      .withContext('fast swipe')
      .toBeFalse();
    expect(isMouseWheel(new WheelEvent('wheel', { deltaX: 12 })))
      .withContext('horizontal only')
      .toBeFalse();
  });
});

describe('wheelDelta', () => {
  it('caps a fat Windows/Linux wheel event at zoomStep', () => {
    // 100px notch would be delta 0.2 (+14.9%) with d3's default
    const delta = wheelDelta(new WheelEvent('wheel', { deltaY: 100, ctrlKey: true }), 0.07, false);

    expect(factor(delta)).toBeCloseTo(1 / 1.07, 5);
  });

  it('caps a page-mode event, which would otherwise double the zoom', () => {
    const delta = wheelDelta(new WheelEvent('wheel', { deltaY: -1, deltaMode: 2 }), 0.07);

    expect(factor(delta)).toBeCloseTo(1.07, 5);
  });

  it('leaves a small delta untouched', () => {
    const delta = wheelDelta(new WheelEvent('wheel', { deltaY: -10 }), 0.07, false);

    expect(delta).toBeCloseTo(0.02, 5);
  });

  it('boosts a tiny macOS pinch so it is not imperceptible', () => {
    const event = new WheelEvent('wheel', { deltaY: -2, ctrlKey: true });

    expect(wheelDelta(event, 0.07, true)).toBeCloseTo(0.04, 5);
    expect(wheelDelta(event, 0.07, false)).toBeCloseTo(0.004, 5);
  });

  it('does not boost plain wheel on macOS', () => {
    const delta = wheelDelta(new WheelEvent('wheel', { deltaY: -2 }), 0.07, true);

    expect(delta).toBeCloseTo(0.004, 5);
  });

  it('takes exactly one zoomStep per mouse notch, whatever its size', () => {
    const firefox = wheelDelta(new WheelEvent('wheel', { deltaY: -3, deltaMode: 1 }), 0.2, false);
    const macChrome = wheelDelta(chromeWheel(4.000244140625, 120), 0.2, true);

    expect(factor(firefox)).toBeCloseTo(1.2, 5);
    expect(factor(macChrome)).toBeCloseTo(1 / 1.2, 5);
  });

  it('keeps zoom-in and zoom-out symmetric', () => {
    const inDelta = wheelDelta(new WheelEvent('wheel', { deltaY: -100 }), 0.07, false);
    const outDelta = wheelDelta(new WheelEvent('wheel', { deltaY: 100 }), 0.07, false);

    expect(inDelta).toBeCloseTo(-outDelta, 10);
    expect(factor(inDelta) * factor(outDelta)).toBeCloseTo(1, 10);
  });

  it('honors the zoomStep knob', () => {
    // deltaY big enough that the cap, not the raw delta, decides
    expect(factor(wheelDelta(new WheelEvent('wheel', { deltaY: -500 }), 0.3, false))).toBeCloseTo(1.3, 5);
    expect(factor(wheelDelta(new WheelEvent('wheel', { deltaY: -500 }), 0.02, false))).toBeCloseTo(1.02, 5);
  });

  it('leaves the delta alone when zoomStep is above it', () => {
    const delta = wheelDelta(new WheelEvent('wheel', { deltaY: -100 }), 0.3, false);

    expect(delta).toBeCloseTo(0.2, 5);
  });

  it('no longer crosses the whole scale extent in a Windows pinch burst', () => {
    // the reported bug: ~10 ctrl+wheel events at 60fps took the flow from 0.5 to maxZoom 3
    let zoom = 0.5;
    for (let i = 0; i < 10; i++) {
      zoom *= factor(wheelDelta(new WheelEvent('wheel', { deltaY: -100, ctrlKey: true }), 0.07, false));
    }

    expect(zoom).toBeLessThan(1.1);
  });
});
