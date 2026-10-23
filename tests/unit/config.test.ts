import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config", () => {
  it("builds a standalone server for cPanel", () => {
    expect(nextConfig.output).toBe("standalone");
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("301-redirects the old static-site URLs", async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual({
      source: "/leo.html",
      destination: "/leadership",
      statusCode: 301,
    });
    expect(redirects).toContainEqual({ source: "/index.html", destination: "/", statusCode: 301 });
  });
});
