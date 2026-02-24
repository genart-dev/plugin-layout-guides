import type {
  LayerTypeDefinition,
  LayerPropertySchema,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import { COMMON_GUIDE_PROPERTIES, setupGuideStyle, drawLine } from "./shared.js";

const DIAGONAL_PROPERTIES: LayerPropertySchema[] = [
  ...COMMON_GUIDE_PROPERTIES,
  {
    key: "pattern",
    label: "Pattern",
    type: "select",
    default: "x",
    group: "diagonal",
    options: [
      { value: "x", label: "X (both diagonals)" },
      { value: "baroque", label: "Baroque (top-left to bottom-right)" },
      { value: "sinister", label: "Sinister (top-right to bottom-left)" },
    ],
  },
];

export const diagonalGuideLayerType: LayerTypeDefinition = {
  typeId: "guides:diagonal",
  displayName: "Diagonal Guide",
  icon: "move-diagonal",
  category: "guide",
  properties: DIAGONAL_PROPERTIES,
  propertyEditorId: "guides:diagonal-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of DIAGONAL_PROPERTIES) {
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
    const pattern = (properties.pattern as string) ?? "x";

    ctx.save();
    setupGuideStyle(ctx, color, lineWidth, dashPattern);

    const { x, y, width, height } = bounds;

    if (pattern === "x" || pattern === "baroque") {
      drawLine(ctx, x, y, x + width, y + height);
    }
    if (pattern === "x" || pattern === "sinister") {
      drawLine(ctx, x + width, y, x, y + height);
    }

    ctx.restore();
  },

  validate(_properties: LayerProperties): ValidationError[] | null {
    return null;
  },
};
