import { Directive, ElementRef, inject } from '@angular/core';

// Root element reference. Historically an <svg>, now the root <div> that hosts the
// HTML-overlay flow (viewport div + edges svg + node divs). Name kept to limit churn.
@Directive({
  standalone: true,
  selector: '[rootSvgRef]',
})
export class RootSvgReferenceDirective {
  public readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}
