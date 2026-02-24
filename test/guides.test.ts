import { describe, it, expect, vi } from "vitest";
import layoutGuidesPlugin from "../src/index.js";
import { gridGuideLayerType } from "../src/grid-guide.js";
import { thirdsGuideLayerType } from "../src/thirds-guide.js";
import { goldenRatioGuideLayerType } from "../src/golden-ratio-guide.js";
import { diagonalGuideLayerType } from "../src/diagonal-guide.js";
import { customGuideLayerType } from "../src/custom-guide.js";
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
    setLineDash: vi.fn(),
    strokeStyle: "",
    lineWidth: 0,
  } as unknown as CanvasRenderingContext2D;
}

describe("layout-guides plugin", () => {
  it("exports a valid DesignPlugin", () => {
    expect(layoutGuidesPlugin.id).toBe("layout-guides");
    expect(layoutGuidesPlugin.tier).toBe("free");
    expect(layoutGuidesPlugin.layerTypes).toHaveLength(5);
    expect(layoutGuidesPlugin.mcpTools).toHaveLength(4);
  });

  it("all layer types have guide category", () => {
    for (const lt of layoutGuidesPlugin.layerTypes) {
      expect(lt.category).toBe("guide");
    }
  });

  it("all layer types have unique typeIds", () => {
    const ids = layoutGuidesPlugin.layerTypes.map((t) => t.typeId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("gridGuideLayerType", () => {
  it("renders grid lines", () => {
    const ctx = createMockCtx();
    gridGuideLayerType.render(gridGuideLayerType.createDefault(), ctx, BOUNDS, RESOURCES);

    expect(ctx.setLineDash).toHaveBeenCalled();
    // 4 columns = 5 vertical lines, 4 rows = 5 horizontal lines = 10 strokes
    expect(ctx.stroke).toHaveBeenCalledTimes(10);
  });

  it("renders with custom columns/rows", () => {
    const ctx = createMockCtx();
    const props = { ...gridGuideLayerType.createDefault(), columns: 3, rows: 2 };
    gridGuideLayerType.render(props, ctx, BOUNDS, RESOURCES);

    // 3 columns = 4 vertical + 2 rows = 3 horizontal = 7 strokes
    expect(ctx.stroke).toHaveBeenCalledTimes(7);
  });

  it("validates columns range", () => {
    expect(gridGuideLayerType.validate({ ...gridGuideLayerType.createDefault(), columns: 0 })).not.toBeNull();
    expect(gridGuideLayerType.validate(gridGuideLayerType.createDefault())).toBeNull();
  });
});

describe("thirdsGuideLayerType", () => {
  it("renders 4 lines (2 vertical + 2 horizontal)", () => {
    const ctx = createMockCtx();
    thirdsGuideLayerType.render(thirdsGuideLayerType.createDefault(), ctx, BOUNDS, RESOURCES);
    expect(ctx.stroke).toHaveBeenCalledTimes(4);
  });

  it("positions lines at 1/3 and 2/3", () => {
    const ctx = createMockCtx();
    thirdsGuideLayerType.render(thirdsGuideLayerType.createDefault(), ctx, BOUNDS, RESOURCES);

    const moveToArgs = (ctx.moveTo as ReturnType<typeof vi.fn>).mock.calls;
    // First vertical line starts at x = 800/3
    expect(moveToArgs[0]![0]).toBeCloseTo(800 / 3, 5);
  });
});

describe("goldenRatioGuideLayerType", () => {
  it("renders 4 lines", () => {
    const ctx = createMockCtx();
    goldenRatioGuideLayerType.render(
      goldenRatioGuideLayerType.createDefault(),
      ctx,
      BOUNDS,
      RESOURCES,
    );
    expect(ctx.stroke).toHaveBeenCalledTimes(4);
  });
});

describe("diagonalGuideLayerType", () => {
  it("renders 2 lines for x pattern", () => {
    const ctx = createMockCtx();
    diagonalGuideLayerType.render(
      diagonalGuideLayerType.createDefault(),
      ctx,
      BOUNDS,
      RESOURCES,
    );
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
  });

  it("renders 1 line for baroque pattern", () => {
    const ctx = createMockCtx();
    const props = { ...diagonalGuideLayerType.createDefault(), pattern: "baroque" };
    diagonalGuideLayerType.render(props, ctx, BOUNDS, RESOURCES);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });
});

describe("customGuideLayerType", () => {
  it("renders a horizontal guide at center", () => {
    const ctx = createMockCtx();
    customGuideLayerType.render(customGuideLayerType.createDefault(), ctx, BOUNDS, RESOURCES);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);

    // Default is horizontal at 50%
    const moveArgs = (ctx.moveTo as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(moveArgs[0]).toBe(0);       // x start
    expect(moveArgs[1]).toBe(300);     // y = 600 * 0.5
  });

  it("renders a vertical guide", () => {
    const ctx = createMockCtx();
    const props = {
      ...customGuideLayerType.createDefault(),
      orientation: "vertical",
      position: 25,
    };
    customGuideLayerType.render(props, ctx, BOUNDS, RESOURCES);

    const moveArgs = (ctx.moveTo as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(moveArgs[0]).toBe(200);     // x = 800 * 0.25
    expect(moveArgs[1]).toBe(0);       // y start
  });

  it("validates position range", () => {
    expect(customGuideLayerType.validate({ ...customGuideLayerType.createDefault(), position: -1 })).not.toBeNull();
    expect(customGuideLayerType.validate({ ...customGuideLayerType.createDefault(), position: 101 })).not.toBeNull();
    expect(customGuideLayerType.validate(customGuideLayerType.createDefault())).toBeNull();
  });
});
