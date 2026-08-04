import { Injectable, WritableSignal, signal } from '@angular/core';
import { Background } from '../types/background.type';
import { DEFAULT_OPTIMIZATION, Optimization } from '../interfaces/optimization.interface';
import { SelectionMode } from '../types/selection-mode.type';
import { SelectionBoxSettings } from '../interfaces/selection-box-settings.interface';

@Injectable()
export class FlowSettingsService {
  public entitiesSelectable = signal(true);

  public elevateNodesOnSelect = signal(true);
  public elevateEdgesOnSelect = signal(true);
  public autoPan = signal(true);

  /**
   * @see {VflowComponent.view}
   */
  public view: WritableSignal<[number, number] | 'auto'> = signal([400, 400]);

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowWidth = signal(0);

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowHeight = signal(0);

  /**
   * When true, two-finger trackpad scroll (or mouse wheel) pans the viewport
   * and pinch gestures zoom it. When false (default), wheel/scroll zooms.
   */
  public panOnScroll = signal(false);

  /**
   * px the pointer must travel from press before a connection/reconnection drag
   * starts (0 = start on press). Lets large handle surfaces still receive plain clicks.
   */
  public connectionStartDistance = signal(0);

  public minZoom = signal(0.5);

  public maxZoom = signal(3);

  /**
   * Max zoom change a single wheel/pinch event may apply, as a fraction:
   * 0.07 = 7% per event (~10 mouse notches to double). Caps fat wheel events so
   * one gesture cannot leap the whole scale extent. Raise for a snappier mouse
   * wheel, lower for calmer touchpads.
   */
  public zoomStep = signal(0.07);

  public background = signal<Background>({ type: 'solid', color: '#fff' });

  public snapGrid = signal<[number, number]>([1, 1]);

  public optimization = signal<Required<Optimization>>(DEFAULT_OPTIMIZATION);

  public selectionMode = signal<SelectionMode>('default');

  public selectionBox = signal<Required<SelectionBoxSettings>>({
    mode: 'full',
    color: '#bbe1fa',
  });
}
