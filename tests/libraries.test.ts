import { describe, it, expect } from "vitest";
import { loadLibraries } from "@/engine/libraries";

describe("libraries", () => {
  it("defaults to empty when no libraries.json exists", () => {
    const lib = loadLibraries();
    expect(lib.anchors).toEqual([]);
    expect(lib.commodities).toEqual([]);
  });
});
