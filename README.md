> [!WARNING]
> This is a **fork** of [ngx-vflow](https://github.com/artem-mangilev/ngx-vflow) containing experimental features (e.g. rendering the flow as an HTML overlay instead of SVG `foreignObject`). It is published as `@adrianwidmer/ngx-vflow` for internal use and may break or diverge at any time. **Most users should use the original [ngx-vflow](https://www.npmjs.com/package/ngx-vflow) package instead.**

<div align="center">

# ngx-vflow

[![NPM Version](https://img.shields.io/npm/v/ngx-vflow?color=blue)](https://www.npmjs.com/package/ngx-vflow)
[![License](https://img.shields.io/badge/license-MIT-007EC7.svg)](LICENSE)
[![Discord](https://img.shields.io/badge/discord-ngx--vflow-5865F2?logo=discord&logoColor=white)](https://discord.gg/RavS5ydTJV)

**A powerful Angular library for building node-based UIs**

[Documentation](https://www.ngx-vflow.org/) • [API Reference](https://www.ngx-vflow.org/api)

</div>

<img width="1305" alt="ngx-vflow showcase" src="https://github.com/artem-mangilev/ngx-vflow/assets/53087914/5cbd3669-10a5-4ecb-9a1f-c9ae4eb5fb5a">

---

- **Declarative API & Full Customization** - Custom nodes, edges, and handles with Angular components
- **Subflows** - Create nested flows with parent-child relationships
- **Interactive Connections** - Create, validate, and reconnect edges
- **Rich Interactions** - Dragging, selecting, zooming, panning, and keyboard shortcuts
- **Precise Control** - Snap to grid, alignment helpers, and custom backgrounds
- **Navigation** - Built-in minimap
- **Performance** - Virtualization and lazy loading for large graphs
- **Reactivity** - Uses Signals to keep internal and external states in sync
- **Layout Algorithms** - Integration with any layouts

## Installation

```bash
# this fork
npm install @adrianwidmer/ngx-vflow --save

# original
npm install ngx-vflow --save
```

## Version Compatibility

| ngx-vflow | Angular   |
| --------- | --------- |
| v0.x      | v16.2.0+  |
| v1.x      | v17.3.12+ |
| v2.x      | v19.2.17+ |

## Publishing a New Version (this fork)

Published manually to npm as `@adrianwidmer/ngx-vflow`:

```bash
# 1. Bump the version (patch/minor/major)
npm version patch --prefix projects/ngx-vflow-lib

# 2. Build the library (version is copied into dist)
npx ng build ngx-vflow-lib

# 3. Publish from dist
cd dist/ngx-vflow-lib
npm publish
```

Requires a one-time `npm login` with an account that owns the `@adrianwidmer` scope.

## Community & Support

- Join our [Discord community](https://discord.gg/RavS5ydTJV) for help and discussions
- Report bugs and request features on [GitHub Issues](https://github.com/artem-mangilev/ngx-vflow/issues)
- Check out the [documentation](https://www.ngx-vflow.org/) for guides and examples

## License

MIT © [Artem Mangilev](https://github.com/artem-mangilev)
