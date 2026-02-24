import type {
  LayerTypeDefinition,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import { COMMON_GUIDE_PROPERTIES, setupGuideStyle, drawLine } from "./shared.js";

export const thirdsGuideLayerType: LayerTypeDefinition = {
  typeId: "guides:thirds",
  displayName: "Rule of Thirds",
  icon: "hash",
  category: "guide",
  properties: COMMON_GUIDE_PROPERTIES,
  propertyEditorId: "guides:thirds-editor",

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

    // Two vertical lines at 1/3 and 2/3
    const x1 = bounds.x + bounds.width / 3;
    const x2 = bounds.x + (bounds.width * 2) / 3;
    drawLine(ctx, x1, bounds.y, x1, bounds.y + bounds.height);
    drawLine(ctx, x2, bounds.y, x2, bounds.y + bounds.height);

    // Two horizontal lines at 1/3 and 2/3
    const y1 = bounds.y + bounds.height / 3;
    const y2 = bounds.y + (bounds.height * 2) / 3;
    drawLine(ctx, bounds.x, y1, bounds.x + bounds.width, y1);
    drawLine(ctx, bounds.x, y2, bounds.x + bounds.width, y2);

    ctx.restore();
  },

  validate(_properties: LayerProperties): ValidationError[] | null {
    return null;
  },
};
