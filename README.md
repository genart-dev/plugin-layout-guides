# @genart-dev/plugin-layout-guides

Composition guide design layer plugin for [genart.dev](https://genart.dev) — overlay rule of thirds, golden ratio, grid, diagonal, and custom guides on any sketch. Guides are non-destructive display layers that aid composition without affecting export. Includes MCP tools for AI-agent control.

Part of [genart.dev](https://genart.dev) — a generative art platform with an MCP server, desktop app, and IDE extensions.

## Install

```bash
npm install @genart-dev/plugin-layout-guides
```

## Usage

```typescript
import layoutGuidesPlugin from "@genart-dev/plugin-layout-guides";
import { createDefaultRegistry } from "@genart-dev/core";

const registry = createDefaultRegistry();
registry.registerPlugin(layoutGuidesPlugin);

// Or access individual layer types
import {
  gridGuideLayerType,
  thirdsGuideLayerType,
  goldenRatioGuideLayerType,
  diagonalGuideLayerType,
  customGuideLayerType,
  guideMcpTools,
} from "@genart-dev/plugin-layout-guides";
```

## Guide Layers (5)

All guide layers share common style properties and render as dashed lines over the sketch canvas.

### Common Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `guideColor` | color | `"rgba(0,200,255,0.5)"` | Guide line color |
| `lineWidth` | number | `1` | Line width in pixels (0.5–5) |
| `dashPattern` | string | `"6,4"` | CSS dash pattern (comma-separated lengths) |

### Rule of Thirds (`guides:thirds`)

Draws a 3×3 grid — two vertical and two horizontal lines at 33% and 66% of canvas width/height. Power points at intersections.

*(Common properties only.)*

### Golden Ratio (`guides:golden-ratio`)

Draws the golden ratio spiral alignment guides — vertical and horizontal lines at 38.2% / 61.8% of canvas dimensions, plus optional spiral overlay.

*(Common properties only.)*

### Grid (`guides:grid`)

Uniform grid of evenly spaced horizontal and vertical lines.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `columns` | number | `4` | Number of columns (1–100) |
| `rows` | number | `4` | Number of rows (1–100) |

### Diagonal (`guides:diagonal`)

Corner-to-corner diagonal lines for dynamic composition analysis.

*(Common properties only — draws all four diagonals.)*

### Custom Guide (`guides:custom`)

A single horizontal or vertical line at a specified canvas percentage.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `orientation` | select | `"horizontal"` | `"horizontal"` or `"vertical"` |
| `position` | number | `50` | Position as percentage of canvas (0–100) |

## MCP Tools (4)

Exposed to AI agents through the MCP server when this plugin is registered:

| Tool | Description |
|------|-------------|
| `add_guide` | Add a composition guide layer (thirds, golden-ratio, grid, diagonal) |
| `add_custom_guide` | Add a single horizontal or vertical guide at a percentage position |
| `toggle_guides` | Show or hide all guide layers simultaneously |
| `clear_guides` | Remove all guide layers from the canvas |

## Related Packages

| Package | Purpose |
|---------|---------|
| [`@genart-dev/core`](https://github.com/genart-dev/core) | Plugin host, layer system (dependency) |
| [`@genart-dev/mcp-server`](https://github.com/genart-dev/mcp-server) | MCP server that surfaces plugin tools to AI agents |

## Support

Questions, bugs, or feedback — [support@genart.dev](mailto:support@genart.dev) or [open an issue](https://github.com/genart-dev/plugin-layout-guides/issues).

## License

MIT
