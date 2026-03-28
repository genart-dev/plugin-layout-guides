import type { DesignPlugin, PluginContext } from "@genart-dev/core";
import { gridGuideLayerType } from "./grid-guide.js";
import { thirdsGuideLayerType } from "./thirds-guide.js";
import { goldenRatioGuideLayerType } from "./golden-ratio-guide.js";
import { diagonalGuideLayerType } from "./diagonal-guide.js";
import { customGuideLayerType } from "./custom-guide.js";
import { fibonacciGuideLayerType } from "./fibonacci-guide.js";
import { guideMcpTools } from "./guide-tools.js";

const layoutGuidesPlugin: DesignPlugin = {
  id: "layout-guides",
  name: "Layout Guides",
  version: "0.2.0",
  tier: "free",
  description: "Composition guides: grid, rule of thirds, golden ratio, diagonal, custom, fibonacci spiral.",

  layerTypes: [
    gridGuideLayerType,
    thirdsGuideLayerType,
    goldenRatioGuideLayerType,
    diagonalGuideLayerType,
    customGuideLayerType,
    fibonacciGuideLayerType,
  ],
  tools: [],
  exportHandlers: [],
  mcpTools: guideMcpTools,

  async initialize(_context: PluginContext): Promise<void> {
    // No async setup needed for guides
  },

  dispose(): void {
    // No resources to release
  },
};

export default layoutGuidesPlugin;
export { gridGuideLayerType } from "./grid-guide.js";
export { thirdsGuideLayerType } from "./thirds-guide.js";
export { goldenRatioGuideLayerType } from "./golden-ratio-guide.js";
export { diagonalGuideLayerType } from "./diagonal-guide.js";
export { customGuideLayerType } from "./custom-guide.js";
export { fibonacciGuideLayerType } from "./fibonacci-guide.js";
export { guideMcpTools } from "./guide-tools.js";
