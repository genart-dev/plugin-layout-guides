import { describe, it, expect, vi } from "vitest";
import { fibonacciGuideLayerType } from "../src/fibonacci-guide.js";
import type { LayerBounds, RenderResources } from "@genart-dev/core";

const BOUNDS: LayerBounds = {
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
};

const RESOURCES: RenderResources = {
  getFont: () => null,
  getImage: () => null,
  theme: "dark",
  pixelRatio: 1,
};

function createMockCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    strokeRect: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: "",
    lineWidth: 0,
  } as unknown as CanvasRenderingContext2D;
}

describe("fibonacciGuideLayerType", () => {
  it("has correct typeId", () => {
    expect(fibonacciGuideLayerType.typeId).toBe("guides:fibonacci");
  });

  it("has guide category", () => {
    expect(fibonacciGuideLayerType.category).toBe("guide");
  });

  it("creates default properties with expected values", () => {
    const defaults = fibonacciGuideLayerType.createDefault();
    expect(defaults.divisions).toBe(8);
    expect(defaults.showSpiral).toBe(true);
    expect(defaults.showRectangles).toBe(true);
    expect(defaults.guideColor).toBe("rgba(0,200,255,0.5)");
    expect(defaults.lineWidth).toBe(1);
  });

  it("renders rectangles and arcs by default", () => {
    const ctx = createMockCtx();
    fibonacciGuideLayerType.render(
      fibonacciGuideLayerType.createDefault(),
      ctx,
      BOUNDS,
      RESOURCES,
    );
    // With showRectangles=true, strokeRect is called for each subdivision
    expect(ctx.strokeRect).toHaveBeenCalled();
    // With showSpiral=true, arc is called for each subdivision
    expect(ctx.arc).toHaveBeenCalled();
  });

  it("skips rectangles when showRectangles is false", () => {
    const ctx = createMockCtx();
    const props = { ...fibonacciGuideLayerType.createDefault(), showRectangles: false };
    fibonacciGuideLayerType.render(props, ctx, BOUNDS, RESOURCES);
    expect(ctx.strokeRect).not.toHaveBeenCalled();
    // Spiral arcs should still render
    expect(ctx.arc).toHaveBeenCalled();
  });

  it("skips spiral when showSpiral is false", () => {
    const ctx = createMockCtx();
    const props = { ...fibonacciGuideLayerType.createDefault(), showSpiral: false };
    fibonacciGuideLayerType.render(props, ctx, BOUNDS, RESOURCES);
    expect(ctx.arc).not.toHaveBeenCalled();
    // Rectangles should still render
    expect(ctx.strokeRect).toHaveBeenCalled();
  });

  it("renders fewer subdivisions with smaller divisions", () => {
    const ctx = createMockCtx();
    const props = { ...fibonacciGuideLayerType.createDefault(), divisions: 3 };
    fibonacciGuideLayerType.render(props, ctx, BOUNDS, RESOURCES);
    expect(ctx.strokeRect).toHaveBeenCalledTimes(3);
    expect(ctx.arc).toHaveBeenCalledTimes(3);
  });

  it("calls save and restore on ctx", () => {
    const ctx = createMockCtx();
    fibonacciGuideLayerType.render(
      fibonacciGuideLayerType.createDefault(),
      ctx,
      BOUNDS,
      RESOURCES,
    );
    expect(ctx.save).toHaveBeenCalledTimes(1);
    expect(ctx.restore).toHaveBeenCalledTimes(1);
  });

  it("validate returns null for valid properties", () => {
    expect(fibonacciGuideLayerType.validate(fibonacciGuideLayerType.createDefault())).toBeNull();
  });

  it("validate rejects divisions < 2", () => {
    const errors = fibonacciGuideLayerType.validate({
      ...fibonacciGuideLayerType.createDefault(),
      divisions: 1,
    });
    expect(errors).not.toBeNull();
    expect(errors![0]!.property).toBe("divisions");
  });

  it("validate rejects divisions > 14", () => {
    const errors = fibonacciGuideLayerType.validate({
      ...fibonacciGuideLayerType.createDefault(),
      divisions: 15,
    });
    expect(errors).not.toBeNull();
    expect(errors![0]!.property).toBe("divisions");
  });
});
