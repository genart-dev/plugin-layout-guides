import type {
  LayerTypeDefinition,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import { COMMON_GUIDE_PROPERTIES, setupGuideStyle, drawLine } from "./shared.js";

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI; // ≈ 0.618

export const goldenRatioGuideLayerType: LayerTypeDefinition = {
  typeId: "guides:golden-ratio",
  displayName: "Golden Ratio",
  icon: "spiral",
  category: "guide",
  properties: COMMON_GUIDE_PROPERTIES,
  propertyEditorId: "guides:golden-ratio-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of COMMON_GUIDE_PROPERTIES) {
      props[schema.key] = schema.default;
    }
    return props;
  },

  render(
    properties: LayerProperties,
    ctx: CanvasRenderingContext2D,
    bounds: LayerBounds,
    _resources: RenderResources,
  ): void {
    const color = (properties.guideColor as string) ?? "rgba(0,200,255,0.5)";
    const lineWidth = (properties.lineWidth as number) ?? 1;
    const dashPattern = (properties.dashPattern as string) ?? "6,4";

    ctx.save();
    setupGuideStyle(ctx, color, lineWidth, dashPattern);

    // Vertical golden ratio lines
    const xLeft = bounds.x + bounds.width * (1 - PHI_INV);
    const xRight = bounds.x + bounds.width * PHI_INV;
    drawLine(ctx, xLeft, bounds.y, xLeft, bounds.y + bounds.height);
    drawLine(ctx, xRight, bounds.y, xRight, bounds.y + bounds.height);

    // Horizontal golden ratio lines
    const yTop = bounds.y + bounds.height * (1 - PHI_INV);
    const yBottom = bounds.y + bounds.height * PHI_INV;
    drawLine(ctx, bounds.x, yTop, bounds.x + bounds.width, yTop);
    drawLine(ctx, bounds.x, yBottom, bounds.x + bounds.width, yBottom);

    ctx.restore();
  },

  validate(_properties: LayerProperties): ValidationError[] | null {
    return null;
  },
};

export { PHI, PHI_INV };
