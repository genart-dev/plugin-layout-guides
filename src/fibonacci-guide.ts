import type {
  LayerTypeDefinition,
  LayerProperties,
  LayerBounds,
  RenderResources,
  LayerPropertySchema,
  ValidationError,
} from "@genart-dev/core";
import { COMMON_GUIDE_PROPERTIES, setupGuideStyle } from "./shared.js";

const PHI = 1.618033988749895;

const FIBONACCI_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "divisions",
    label: "Divisions",
    type: "number",
    default: 8,
    min: 2,
    max: 14,
    step: 1,
    group: "fibonacci",
  },
  {
    key: "showSpiral",
    label: "Show Spiral",
    type: "boolean",
    default: true,
    group: "fibonacci",
  },
  {
    key: "showRectangles",
    label: "Show Rectangles",
    type: "boolean",
    default: true,
    group: "fibonacci",
  },
  ...COMMON_GUIDE_PROPERTIES,
];

/**
 * Draw a quarter-arc inside a square based on which corner the arc pivots from.
 * `rotationIndex` 0–3 cycles through the four corners.
 */
function drawQuarterArc(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  rotationIndex: number,
): void {
  let cx: number, cy: number, startAngle: number;

  switch (rotationIndex % 4) {
    case 0: // pivot bottom-right
      cx = sx + size;
      cy = sy + size;
      startAngle = Math.PI;
      break;
    case 1: // pivot bottom-left
      cx = sx;
      cy = sy + size;
      startAngle = -Math.PI / 2;
      break;
    case 2: // pivot top-left
      cx = sx;
      cy = sy;
      startAngle = 0;
      break;
    default: // pivot top-right
      cx = sx + size;
      cy = sy;
      startAngle = Math.PI / 2;
      break;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, size, startAngle, startAngle + Math.PI / 2);
  ctx.stroke();
}

/**
 * Fibonacci guide layer — draws golden rectangle subdivisions
 * and an approximate fibonacci spiral using quarter-circle arcs.
 */
export const fibonacciGuideLayerType: LayerTypeDefinition = {
  typeId: "guides:fibonacci",
  displayName: "Fibonacci Guide",
  icon: "spiral",
  category: "guide",
  properties: FIBONACCI_PROPERTIES,
  propertyEditorId: "guides:fibonacci-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of FIBONACCI_PROPERTIES) {
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
    const lw = (properties.lineWidth as number) ?? 1;
    const dash = (properties.dashPattern as string) ?? "6,4";
    const divisions = (properties.divisions as number) ?? 8;
    const showSpiral = (properties.showSpiral as boolean) ?? true;
    const showRectangles = (properties.showRectangles as boolean) ?? true;

    ctx.save();
    setupGuideStyle(ctx, color, lw, dash);

    // Fit the largest golden rectangle into bounds
    const { x: bx, y: by, width: bw, height: bh } = bounds;
    let gw: number, gh: number;
    if (bw / bh > PHI) {
      gh = bh;
      gw = gh * PHI;
    } else {
      gw = bw;
      gh = gw / PHI;
    }
    const ox = bx + (bw - gw) / 2;
    const oy = by + (bh - gh) / 2;

    // Subdivide using golden ratio
    let rx = ox, ry = oy, rw = gw, rh = gh;
    let rot = 0;

    for (let i = 0; i < divisions; i++) {
      if (rw < 1 || rh < 1) break;

      const isWide = rw >= rh;
      const shortSide = isWide ? rh : rw;
      const squareSize = shortSide;

      // Determine square position based on rotation index
      let sx: number, sy: number;
      let nextRx: number, nextRy: number, nextRw: number, nextRh: number;

      if (isWide) {
        switch (rot % 4) {
          case 0:
          case 3:
            sx = rx; sy = ry;
            nextRx = rx + squareSize; nextRy = ry;
            nextRw = rw - squareSize; nextRh = rh;
            break;
          default:
            sx = rx + rw - squareSize; sy = ry;
            nextRx = rx; nextRy = ry;
            nextRw = rw - squareSize; nextRh = rh;
            break;
        }
      } else {
        switch (rot % 4) {
          case 0:
          case 1:
            sx = rx; sy = ry;
            nextRx = rx; nextRy = ry + squareSize;
            nextRw = rw; nextRh = rh - squareSize;
            break;
          default:
            sx = rx; sy = ry + rh - squareSize;
            nextRx = rx; nextRy = ry;
            nextRw = rw; nextRh = rh - squareSize;
            break;
        }
      }

      if (showRectangles) {
        ctx.strokeRect(sx, sy, squareSize, squareSize);
      }

      if (showSpiral) {
        drawQuarterArc(ctx, sx, sy, squareSize, rot);
      }

      rx = nextRx!;
      ry = nextRy!;
      rw = nextRw!;
      rh = nextRh!;
      rot = (rot + 1) % 4;
    }

    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];
    const divisions = properties.divisions;
    if (typeof divisions === "number" && (divisions < 2 || divisions > 14)) {
      errors.push({ property: "divisions", message: "Divisions must be 2–14." });
    }
    return errors.length > 0 ? errors : null;
  },
};
