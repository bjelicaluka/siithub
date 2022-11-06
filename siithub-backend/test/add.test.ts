import { describe, expect, it } from "@jest/globals";
import { add } from "../src/utils/add";

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(1, 3)).toBe(4);
  });
});
