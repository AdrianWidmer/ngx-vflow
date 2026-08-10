import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EdgeComponent } from '../../components/edge/edge.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { EdgeRenderingService } from '../../services/edge-rendering.service';

@Component({
  selector: 'g[customTemplateEdge]',
  templateUrl: './custom-template-edge.component.html',
  styleUrls: ['./custom-template-edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  host: {
    // Elevate on CLICK, never on mousedown: pulling re-sorts the edge list, and Angular's reorder
    // detaches + reinserts this <g> between mousedown and mouseup — after which Chrome dispatches
    // no `click` at all, so SelectableDirective never sees the wire and it can't be selected or
    // deleted. The built-in edge pulls from its click handler for the same reason.
    '(click)': 'pull()',
  },
})
export class CustomTemplateEdgeComponent {
  private edge = inject(EdgeComponent);
  private flowSettingsService = inject(FlowSettingsService);
  private edgeRenderingService = inject(EdgeRenderingService);

  protected model = this.edge.model();
  protected context = this.model.context.$implicit;

  protected pull() {
    if (this.flowSettingsService.elevateEdgesOnSelect()) {
      this.edgeRenderingService.pull(this.model);
    }
  }
}
