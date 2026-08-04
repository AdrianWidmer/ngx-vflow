import { Directive, ElementRef, NgZone, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { select } from 'd3-selection';
import { D3ZoomEvent, ZoomBehavior, ZoomTransform, zoom, zoomIdentity } from 'd3-zoom';
import { ViewportService } from '../services/viewport.service';
import { isDefined } from '../utils/is-defined';
import { RootSvgReferenceDirective } from './reference.directive';
import { ViewportState } from '../interfaces/viewport.interface';
import { SelectionService, ViewportForSelection } from '../services/selection.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { KeyboardService } from '../services/keyboard.service';
import { allowRootZoomForNodeTarget } from '../utils/allow-root-zoom-for-node-target';
import { wheelDelta } from '../utils/wheel-delta';

@Directive({
  standalone: true,
  selector: '[mapContext]',
  host: {
    '[style.transform]': 'transform()',
  },
})
export class MapContextDirective implements OnInit {
  protected rootSvg = inject(RootSvgReferenceDirective).element;
  protected host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected selectionService = inject(SelectionService);
  protected viewportService = inject(ViewportService);
  protected flowSettingsService = inject(FlowSettingsService);
  protected keyboardService = inject(KeyboardService);
  protected zone = inject(NgZone);

  protected rootSvgSelection = select(this.rootSvg);

  protected transform = signal<string>('');

  protected viewportForSelection: Partial<ViewportForSelection> = {};

  // under the hood this effect triggers handleZoom, so error throws without this flag
  protected manualViewportChangeEffect = effect(() => {
    const viewport = this.viewportService.writableViewport();
    const state = viewport.state;

    if (viewport.changeType === 'initial') {
      return;
    }

    // If only zoom provided
    if (isDefined(state.zoom) && !isDefined(state.x) && !isDefined(state.y)) {
      this.rootSvgSelection.transition().duration(viewport.duration).call(this.zoomBehavior.scaleTo, state.zoom);

      return;
    }

    // If only pan provided
    if (isDefined(state.x) && isDefined(state.y) && !isDefined(state.zoom)) {
      // remain same zoom value
      const zoom = untracked(this.viewportService.readableViewport).zoom;

      this.rootSvgSelection
        .transition()
        .duration(viewport.duration)
        .call(this.zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(zoom));

      return;
    }

    // If whole viewort state provided
    if (isDefined(state.x) && isDefined(state.y) && isDefined(state.zoom)) {
      this.rootSvgSelection
        .transition()
        .duration(viewport.duration)
        .call(this.zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(state.zoom));

      return;
    }
  });

  protected zoomBehavior!: ZoomBehavior<HTMLElement, unknown>;

  public ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.zoomBehavior = zoom<HTMLElement, unknown>()
        .scaleExtent([this.flowSettingsService.minZoom(), this.flowSettingsService.maxZoom()])
        .wheelDelta(this.handleWheelDelta)
        .filter(this.filterCondition)
        .on('start', this.handleZoomStart)
        .on('zoom', this.handleZoom)
        .on('end', this.handleZoomEnd);

      this.rootSvgSelection.call(this.zoomBehavior).on('dblclick.zoom', null);

      // Non-passive so we can preventDefault (block page scroll / browser nav gestures).
      this.rootSvg.addEventListener('wheel', this.handlePanOnScroll, { passive: false });
    });
  }

  /**
   * panOnScroll mode: plain two-finger scroll pans the viewport. Trackpad pinch is
   * reported by all engines (Chrome/Firefox/Safari, macOS/Windows/Linux) as a wheel
   * event with ctrlKey=true — those stay with d3-zoom (see filterCondition).
   */
  private handlePanOnScroll = (event: WheelEvent) => {
    if (!this.flowSettingsService.panOnScroll() || isPinchWheel(event)) {
      return;
    }

    event.preventDefault();

    // deltaMode 1 = lines (Firefox mouse wheel), 2 = pages — normalize to pixels
    const factor = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? this.rootSvg.clientHeight : 1;
    const zoom = this.viewportService.readableViewport().zoom;

    // translateBy multiplies by the current scale internally, so divide it out
    // to pan by exact screen pixels
    this.zoomBehavior.translateBy(
      this.rootSvgSelection,
      (-event.deltaX * factor) / zoom,
      (-event.deltaY * factor) / zoom,
    );
  };

  // d3's default delta is unusable across platforms, see wheelDelta
  private handleWheelDelta = (event: WheelEvent): number => wheelDelta(event, this.flowSettingsService.zoomStep());

  private handleZoom = ({ transform }: ZoomEvent) => {
    // update public signal for user to read
    this.viewportService.readableViewport.set(mapTransformToViewportState(transform));

    // CSS transform on the viewport div (NOT ZoomTransform.toString(), which emits SVG-style
    // "translate(x,y) scale(k)" without px units and is invalid for CSS).
    this.transform.set(`translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`);
  };

  private handleZoomStart = ({ transform }: ZoomEvent) => {
    this.viewportForSelection = {
      start: mapTransformToViewportState(transform),
    };
  };

  private handleZoomEnd = ({ transform, sourceEvent }: ZoomEvent) => {
    this.zone.run(() => {
      this.viewportForSelection = {
        ...this.viewportForSelection,
        end: mapTransformToViewportState(transform),
        target: evTarget(sourceEvent),
      };

      this.viewportService.triggerViewportChangeEvent('end');

      // TODO: maybe use triggerViewportChangeEvent instead of this method?
      this.selectionService.setViewport(this.viewportForSelection as ViewportForSelection);
    });
  };

  private filterCondition = (event: Event) => {
    // panOnScroll: plain wheel pans (handlePanOnScroll), only pinch (ctrlKey) zooms via d3
    if (this.flowSettingsService.panOnScroll() && event.type === 'wheel' && !isPinchWheel(event as WheelEvent)) {
      return false;
    }

    return allowRootZoomForNodeTarget(event, this.keyboardService.isActiveAction('selection'));
  };
}

// Trackpad pinch arrives as a wheel event with ctrlKey set (all engines & platforms).
// metaKey included so cmd+scroll on macOS also zooms, mirroring common flow tools.
const isPinchWheel = (event: WheelEvent): boolean => event.ctrlKey || event.metaKey;

const mapTransformToViewportState = (transform: ZoomTransform): ViewportState => ({
  zoom: transform.k,
  x: transform.x,
  y: transform.y,
});

const evTarget = (anyEvent: any): Element | undefined => {
  if (anyEvent instanceof Event && anyEvent.target instanceof Element) {
    return anyEvent.target;
  }

  return undefined;
};

declare module 'd3-selection' {
  interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    transition(): Selection<GElement, Datum, PElement, PDatum>;
    duration(duration: number): Selection<GElement, Datum, PElement, PDatum>;
  }
}

type ZoomEvent = D3ZoomEvent<HTMLElement, unknown>;
