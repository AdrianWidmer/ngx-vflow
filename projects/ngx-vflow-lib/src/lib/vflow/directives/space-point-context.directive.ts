import { Directive, Signal, computed, inject } from '@angular/core';
import { RootSvgReferenceDirective } from './reference.directive';
import { Point } from '../interfaces/point.interface';
import { RootPointerDirective } from './root-pointer.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { ViewportService } from '../services/viewport.service';

@Directive({
  standalone: true,
  selector: '[spacePointContext]',
})
export class SpacePointContextDirective {
  private pointerMovementDirective = inject(RootPointerDirective);
  private root = inject(RootSvgReferenceDirective).element;
  private viewportService = inject(ViewportService);

  /**
   * Signal with current mouse position in svg space
   */
  public svgCurrentSpacePoint: Signal<Point> = computed(() => {
    // Add dependency on viewport to recalculate when auto-pan changes viewport
    // TODO: hacky solution, need to find a better way
    this.viewportService.readableViewport();

    const point = this.currentPoint();

    if (!point) {
      return { x: 0, y: 0 };
    }

    return this.documentPointToFlowPoint({
      x: point.x,
      y: point.y,
    });
  });

  private currentPoint = toSignal(this.pointerMovementDirective.pointerMovement$);

  public documentPointToFlowPoint(documentPoint: Point): Point {
    // Screen (client) → flow coordinates. The viewport div carries a CSS transform
    // `translate(x,y) scale(zoom)`, so the inverse is: subtract the root's on-screen origin
    // and the pan translation, then divide by zoom. Read the rect per call so it stays correct
    // across page scroll / resize.
    const rect = this.root.getBoundingClientRect();
    const { x, y, zoom } = this.viewportService.readableViewport();

    return {
      x: (documentPoint.x - rect.left - x) / zoom,
      y: (documentPoint.y - rect.top - y) / zoom,
    };
  }
}
