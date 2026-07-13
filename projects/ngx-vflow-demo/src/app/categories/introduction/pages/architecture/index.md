This topic explains the rendering model behind the library.

The flow is rendered with a **layered DOM overlay**, the same approach used by React Flow, Vue Flow
and Foblex Flow. Two technologies work together:

- **HTML (with CSS)** renders the nodes and handles. Node content is plain HTML, so you can style it
  with regular CSS, use `z-index`, and rely on native accessibility.
- **SVG** renders the edges (curves, markers) and the connection preview — the things SVG is good at.

## Layers

```
div.vflow                      ← root container
├─ svg.vflow__background        background pattern (screen space)
├─ div.vflow__viewport          pan/zoom layer: CSS transform: translate(x, y) scale(zoom)
│   ├─ svg.vflow__edges          edges + connection preview (flow coordinates)
│   └─ div.vflow-node …          each node is an absolutely-positioned HTML div
│         └─ div.vflow-handle …  handles are HTML elements too
└─ mini-map / preview canvas    (screen space)
```

The key idea: the **viewport** div carries a single CSS `transform`. Everything inside it — the
edges `<svg>` and every node `<div>` — shares that one transform, so nodes, handles and edges stay
aligned automatically. Panning and zooming just update the viewport's `transform`; no per-element
bookkeeping is required.

Because nodes are ordinary HTML (no `<foreignObject>`), they size themselves to their content, work
consistently across browsers (including Safari), support `z-index`, and expose their content to the
accessibility tree.

> Prior to v3 the library rendered everything inside a single root `<svg>` and wrapped node HTML in
> `<foreignObject>`. See the [migration guide](*/introduction/migration-to-v3) for what changed.
