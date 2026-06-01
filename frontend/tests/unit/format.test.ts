import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate } from "@/lib/format";

describe("format helpers", () => {
  it("preserves currency cents", () => {
    expect(formatCurrency(1999)).toBe("$19.99");
  });

  it("formats dates in UTC", () => {
    expect(formatDate("2026-06-01T23:30:00-04:00")).toBe("Jun 2, 2026");
  });
});
