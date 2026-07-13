# Changelog

## 3.0.0

### Breaking changes

- **New rendering engine.** The flow is now rendered as a layered DOM overlay (root `<div>` →
  CSS-transformed viewport `<div>` → an SVG edges layer + HTML node `<div>`s), replacing the previous
  single-root-`<svg>` + `<foreignObject>` approach.

  - The root element is a `<div>` (was `<svg>`); pan/zoom is a CSS `transform` on the viewport `<div>`.
  - Nodes are absolutely-positioned HTML `<div>`s (were `<svg:g>` + `<foreignObject>`).
  - Handles are HTML `<div>`s (were `<svg:circle>`). **Custom handle templates are now authored with
    HTML instead of SVG**, and the library positions them for you (no `ctx.point()` placement).
  - Edges remain SVG, in a dedicated `<svg class="vflow__edges">` layer.

  The public API (`nodes`, `edges`, `<handle>`, `node-toolbar`, templates, component nodes,
  `VflowComponent` inputs/outputs) is unchanged. Only CSS/DOM queries reaching into internal
  structure are affected — see the "Migration to v3" guide.

### Improvements

- Fixes Safari `<foreignObject>` styling limitations.
- `z-index` now works on node content.
- Nodes size to their content without explicit `foreignObject` size tracking.
- Node content participates in the accessibility tree.

### Removed (internal only)

- `HandleSizeControllerDirective` and the `<foreignObject>` Chrome size-fudge constant.
