import type {
  LayerTypeDefinition,
  LayerPropertySchema,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import { COMMON_GUIDE_PROPERTIES, setupGuideStyle, drawLine } from "./shared.js";

const GRID_PROPERTIES: LayerPropertySchema[] = [
  ...COMMON_GUIDE_PROPERTIES,
  {
    key: "columns",
    label: "Columns",
    type: "number",
    default: 4,
    min: 1,
    max: 100,
    step: 1,
    group: "grid",
  },
  {
    key: "rows",
    label: "Rows",
    type: "number",
    default: 4,
    min: 1,
    max: 100,
    step: 1,
    group: "grid",
  },
  {
    key: "gutter",
    label: "Gutter",
    type: "number",
    default: 0,
    min: 0,
    max: 100,
    step: 1,
    group: "grid",
  },
  {
    key: "margin",
    label: "Margin",
    type: "number",
    default: 0,
    min: 0,
    max: 200,
    step: 1,
    group: "grid",
  },
];

export const gridGuideLayerType: LayerTypeDefinition = {
  typeId: "guides:grid",
  displayName: "Grid Guide",
  icon: "grid",
  category: "guide",
  properties: GRID_PROPERTIES,
  propertyEditorId: "guides:grid-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of GRID_PROPERTIES) {
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
    const columns = (properties.columns as number) ?? 4;
    const rows = (properties.rows as number) ?? 4;
    const margin = (properties.margin as number) ?? 0;

    const x0 = bounds.x + margin;
    const y0 = bounds.y + margin;
    const w = bounds.width - margin * 2;
    const h = bounds.height - margin * 2;

    ctx.save();
    setupGuideStyle(ctx, color, lineWidth, dashPattern);

    // Vertical lines
    for (let i = 0; i <= columns; i++) {
      const x = x0 + (w / columns) * i;
      drawLine(ctx, x, y0, x, y0 + h);
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = y0 + (h / rows) * i;
      drawLine(ctx, x0, y, x0 + w, y);
    }

    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];
    const cols = properties.columns;
    if (typeof cols !== "number" || cols < 1 || cols > 100) {
      errors.push({ property: "columns", message: "Columns must be 1–100" });
    }
    const rows = properties.rows;
    if (typeof rows !== "number" || rows < 1 || rows > 100) {
      errors.push({ property: "rows", message: "Rows must be 1–100" });
    }
    return errors.length > 0 ? errors : null;
  },
};
