You can pass a `[template]` to `HandleComponent` with custom handle.

> **Info**
> Since v3, custom handle templates are made with **HTML** (previously SVG). The library positions
> the handle for you, so your template only needs to provide the visual content — a styled element.

- Custom handles are positioned automatically by the library (at the handle's `position`, following
  the content it is attached to). You no longer need to place the handle yourself.
- Custom handles know if validation of `ConnectionSettings.validator()` has failed or succeeded, so
  you can use the `state()` signal in `let-ctx` to add some behavior based on validation result.

Refer to this interface for `let-ctx` when crafting your handle template:

```ts
interface HandleTemplateImplicitContext {
  /**
   * The handle's offset within the node, in flow units. Provided for reference;
   * you do not need it to position the handle (the library does that).
   */
  point: Signal<{ x: number; y: number }>;

  /**
   * Helper signal to get validation state for current handle. 'idle' by default.
   * You can use it do apply some styles based on state
   */
  state: Signal<'valid' | 'invalid' | 'idle'>;

  /**
   * The parent node of this handle
   */
  node: Node;
}
```

{{ NgDocActions.demoPane("CustomHandlesDemoComponent") }}
