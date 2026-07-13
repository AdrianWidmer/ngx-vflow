v3 replaces the rendering engine. The public API for building flows — `nodes`, `edges`, the
`<handle>` component, `node-toolbar`, templates, component nodes, `VflowComponent` inputs and
outputs — is unchanged. **If you only use the documented API, no code changes are required.**

The breaking changes are in the rendered DOM. If you wrote CSS, tests, or DOM queries that reach into
the library's internal structure, read on.

## What changed

Before v3, the whole flow lived inside a single root `<svg>`, node HTML was wrapped in
`<foreignObject>`, and handles were drawn as SVG `<circle>` elements. v3 renders a
[layered DOM overlay](*/introduction/architecture) instead:

- The root element is a `<div>`, not an `<svg>`.
- Pan/zoom is a CSS `transform` on a viewport `<div>` (previously an SVG `transform` attribute).
- Each node is an absolutely-positioned HTML `<div>` (previously an `<svg:g>` + `<foreignObject>`).
- Handles are HTML `<div>` elements (previously `<svg:circle>`).
- Edges remain SVG, now in a dedicated `<svg class="vflow__edges">` layer.

## Why

- **Cross-browser** — no more `<foreignObject>`, so Safari's styling restrictions on it no longer apply.
- **`z-index` works** — nodes are HTML, so stacking is native.
- **Simpler sizing** — nodes size to their content; no explicit `foreignObject` width/height tracking.
- **Accessibility** — node content is real HTML in the accessibility tree.

## If you need to update

- **Custom handle templates are now HTML, not SVG.** Previously a `[template]` handle was authored
  with SVG (e.g. `<svg:circle [attr.cx]="ctx.point().x" .../>`) and positioned itself via
  `ctx.point()`. Now the library positions the handle for you; the template just provides HTML
  content:

  ```html
  <!-- before (v2) -->
  <ng-template #handle let-ctx>
    <svg:circle r="6" fill="#1b262c" [attr.cx]="ctx.point().x" [attr.cy]="ctx.point().y" />
  </ng-template>

  <!-- after (v3) -->
  <ng-template #handle let-ctx>
    <div class="my-handle"></div>
  </ng-template>
  ```

- **CSS targeting internals** — selectors like `.root-svg`, `foreignObject`, or the old
  `.default-handle` circle no longer match. The current class names are `.vflow`, `.vflow__viewport`,
  `.vflow__edges`, `.vflow-node`, and `.vflow-handle`. Styling your own node/handle _content_ is
  unaffected.
- **DOM queries / e2e selectors** — a node host is now `div.vflow-node`, not `g.vflow-node`; a default
  handle is `div.vflow-handle`, not `circle.default-handle`.
- **Deep imports** — the internal `HandleSizeControllerDirective` was removed and the size/offset
  fudge constant for `foreignObject` is gone. These were never part of the public API.

## Peer dependencies

Unchanged: Angular `^19.2.17 || 20.x || 21.x`, `d3-selection`, `d3-drag`, `d3-zoom`, `rxjs`.
