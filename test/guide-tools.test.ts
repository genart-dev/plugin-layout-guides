import { describe, it, expect, vi } from "vitest";
import {
  addGuideTool,
  addCustomGuideTool,
  toggleGuidesTool,
  clearGuidesTool,
} from "../src/guide-tools.js";
import type {
  McpToolContext,
  DesignLayer,
  LayerStackAccessor,
} from "@genart-dev/core";

function createMockLayer(overrides: Partial<DesignLayer> = {}): DesignLayer {
  return {
    id: "guide-1",
    type: "guides:grid",
    name: "Grid Guide",
    visible: true,
    locked: true,
    opacity: 1,
    blendMode: "normal",
    transform: {
      x: 0, y: 0, width: 800, height: 600,
      rotation: 0, scaleX: 1, scaleY: 1, anchorX: 0, anchorY: 0,
    },
    properties: {},
    ...overrides,
  };
}

function createMockContext(layers: DesignLayer[] = []): McpToolContext {
  const layerMap = new Map(layers.map((l) => [l.id, l]));

  const accessor: LayerStackAccessor = {
    getAll: () => layers,
    get: (id: string) => layerMap.get(id) ?? null,
    add: vi.fn((layer: DesignLayer) => {
      layers.push(layer);
      layerMap.set(layer.id, layer);
    }),
    remove: vi.fn((id: string) => {
      const idx = layers.findIndex((l) => l.id === id);
      if (idx >= 0) { layers.splice(idx, 1); layerMap.delete(id); return true; }
      return false;
    }),
    updateProperties: vi.fn(),
    updateTransform: vi.fn(),
    updateBlend: vi.fn(),
    reorder: vi.fn(),
    duplicate: vi.fn(() => "dup-id"),
    count: layers.length,
  };

  return {
    layers: accessor,
    sketchState: {
      seed: 42, params: {}, colorPalette: [],
      canvasWidth: 800, canvasHeight: 600, rendererId: "canvas2d",
    },
    canvasWidth: 800,
    canvasHeight: 600,
    resolveAsset: vi.fn(async () => null),
    captureComposite: vi.fn(async () => Buffer.from("")),
    emitChange: vi.fn(),
  };
}

describe("add_guide tool", () => {
  it("adds a grid guide", async () => {
    const ctx = createMockContext();
    const result = await addGuideTool.handler(
      { type: "grid", columns: 6, rows: 4 },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const layer = (ctx.layers.add as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DesignLayer;
    expect(layer.type).toBe("guides:grid");
    expect(layer.properties.columns).toBe(6);
    expect(layer.locked).toBe(true);
  });

  it("adds a thirds guide", async () => {
    const ctx = createMockContext();
    const result = await addGuideTool.handler({ type: "thirds" }, ctx);
    expect(result.isError).toBeUndefined();
    const layer = (ctx.layers.add as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DesignLayer;
    expect(layer.type).toBe("guides:thirds");
  });

  it("adds a golden-ratio guide", async () => {
    const ctx = createMockContext();
    await addGuideTool.handler({ type: "golden-ratio" }, ctx);
    const layer = (ctx.layers.add as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DesignLayer;
    expect(layer.type).toBe("guides:golden-ratio");
  });

  it("adds a diagonal guide", async () => {
    const ctx = createMockContext();
    await addGuideTool.handler({ type: "diagonal", pattern: "baroque" }, ctx);
    const layer = (ctx.layers.add as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DesignLayer;
    expect(layer.type).toBe("guides:diagonal");
    expect(layer.properties.pattern).toBe("baroque");
  });

  it("rejects unknown guide type", async () => {
    const ctx = createMockContext();
    const result = await addGuideTool.handler({ type: "unknown" }, ctx);
    expect(result.isError).toBe(true);
  });
});

describe("add_custom_guide tool", () => {
  it("adds a horizontal guide at given position", async () => {
    const ctx = createMockContext();
    const result = await addCustomGuideTool.handler(
      { orientation: "horizontal", position: 33 },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const layer = (ctx.layers.add as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DesignLayer;
    expect(layer.type).toBe("guides:custom");
    expect(layer.properties.orientation).toBe("horizontal");
    expect(layer.properties.position).toBe(33);
  });

  it("defaults position to 50", async () => {
    const ctx = createMockContext();
    await addCustomGuideTool.handler({ orientation: "vertical" }, ctx);
    const layer = (ctx.layers.add as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DesignLayer;
    expect(layer.properties.position).toBe(50);
  });
});

describe("toggle_guides tool", () => {
  it("reports no guides when empty", async () => {
    const ctx = createMockContext();
    const result = await toggleGuidesTool.handler({}, ctx);
    expect((result.content[0] as { text: string }).text).toContain("No guide layers");
  });

  it("toggles guide visibility", async () => {
    const guide = createMockLayer();
    const ctx = createMockContext([guide]);
    const result = await toggleGuidesTool.handler({}, ctx);
    expect(result.isError).toBeUndefined();
    expect(ctx.emitChange).toHaveBeenCalledWith("layer-updated");
  });
});

describe("clear_guides tool", () => {
  it("removes all guide layers", async () => {
    const guides = [
      createMockLayer({ id: "g1", type: "guides:grid" }),
      createMockLayer({ id: "g2", type: "guides:thirds" }),
    ];
    const ctx = createMockContext(guides);
    const result = await clearGuidesTool.handler({}, ctx);

    expect(result.isError).toBeUndefined();
    expect(ctx.layers.remove).toHaveBeenCalledTimes(2);
    expect(ctx.emitChange).toHaveBeenCalledWith("layer-removed");
  });

  it("reports when no guides exist", async () => {
    const nonGuide = createMockLayer({ id: "l1", type: "typography:text" });
    const ctx = createMockContext([nonGuide]);
    const result = await clearGuidesTool.handler({}, ctx);
    expect((result.content[0] as { text: string }).text).toContain("No guide layers");
  });
});
