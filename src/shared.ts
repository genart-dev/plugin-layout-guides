import type { LayerPropertySchema, RenderResources } from "@genart-dev/core";

/** Common properties for guide layers. */
export const COMMON_GUIDE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "guideColor",
    label: "Guide Color",
    type: "color",
    default: "rgba(0,200,255,0.5)",
    group: "style",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 1,
    min: 0.5,
    max: 5,
    step: 0.5,
    group: "style",
  },
  {
    key: "dashPattern",
    label: "Dash Pattern",
    type: "string",
    default: "6,4",
    group: "style",
  },
];

/** Set up a context for rendering guide lines. */
export function setupGuideStyle(
  ctx: CanvasRenderingContext2D,
  color: string,
  lineWidth: number,
  dashPattern: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  const dashes = dashPattern
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
  ctx.setLineDash(dashes.length > 0 ? dashes : [6, 4]);
}

/** Draw a single line from (x1,y1) to (x2,y2). */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/**
 * Guides are editor-only. During export, the compositor skips guide layers.
 * Check if we're in an export context by examining the resources theme
 * (in practice, the compositor checks the layer category).
 */
export function isEditorContext(_resources: RenderResources): boolean {
  // Always render — the compositor is responsible for skipping guide layers
  // during export based on category === 'guide'
  return true;
}
