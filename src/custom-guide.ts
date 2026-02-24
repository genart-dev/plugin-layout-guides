import type {
  LayerTypeDefinition,
  LayerPropertySchema,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import { COMMON_GUIDE_PROPERTIES, setupGuideStyle, drawLine } from "./shared.js";

const CUSTOM_PROPERTIES: LayerPropertySchema[] = [
  ...COMMON_GUIDE_PROPERTIES,
  {
    key: "orientation",
    label: "Orientation",
    type: "select",
    default: "horizontal",
    group: "custom",
    options: [
      { value: "horizontal", label: "Horizontal" },
      { value: "vertical", label: "Vertical" },
    ],
  },
  {
    key: "position",
    label: "Position (%)",
    type: "number",
    default: 50,
    min: 0,
    max: 100,
    step: 0.5,
    group: "custom",
  },
];

export const customGuideLayerType: LayerTypeDefinition = {
  typeId: "guides:custom",
  displayName: "Custom Guide",
  icon: "ruler",
  category: "guide",
  properties: CUSTOM_PROPERTIES,
  propertyEditorId: "guides:custom-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of CUSTOM_PROPERTIES) {
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
    const orientation = (properties.orientation as string) ?? "horizontal";
    const position = (properties.position as number) ?? 50;

    ctx.save();
    setupGuideStyle(ctx, color, lineWidth, dashPattern);

    const t = position / 100;

    if (orientation === "horizontal") {
      const y = bounds.y + bounds.height * t;
      drawLine(ctx, bounds.x, y, bounds.x + bounds.width, y);
    } else {
      const x = bounds.x + bounds.width * t;
      drawLine(ctx, x, bounds.y, x, bounds.y + bounds.height);
    }

    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];
    const pos = properties.position;
    if (typeof pos !== "number" || pos < 0 || pos > 100) {
      errors.push({ property: "position", message: "Position must be 0–100" });
    }
    return errors.length > 0 ? errors : null;
  },
};
