import { describe, it, expect } from "vitest";
import { createRateLimiter, isValidWebhookUrl, hashApiKey } from "../rateLimiter.js";

describe("createRateLimiter", () => {
  it("allows requests within limit", () => {
    const limiter = createRateLimiter(3, 60000);
    expect(limiter("ip1")).toBe(false);
    expect(limiter("ip1")).toBe(false);
    expect(limiter("ip1")).toBe(false);
  });

  it("blocks after exceeding max requests", () => {
    const limiter = createRateLimiter(2, 60000);
    limiter("ip2");
    limiter("ip2");
    expect(limiter("ip2")).toBe(true);
  });

  it("tracks different keys independently", () => {
    const limiter = createRateLimiter(1, 60000);
    expect(limiter("a")).toBe(false);
    expect(limiter("b")).toBe(false);
    expect(limiter("a")).toBe(true);
  });
});

describe("isValidWebhookUrl", () => {
  it("accepts valid https URLs", () => {
    expect(isValidWebhookUrl("https://example.com/webhook")).toBe(true);
  });

  it("rejects http URLs", () => {
    expect(isValidWebhookUrl("http://example.com/webhook")).toBe(false);
  });

  it("rejects localhost", () => {
    expect(isValidWebhookUrl("https://localhost/webhook")).toBe(false);
  });

  it("rejects private IPs", () => {
    expect(isValidWebhookUrl("https://192.168.1.1/webhook")).toBe(false);
    expect(isValidWebhookUrl("https://10.0.0.1/webhook")).toBe(false);
    expect(isValidWebhookUrl("https://127.0.0.1/webhook")).toBe(false);
  });

  it("rejects .local and .internal domains", () => {
    expect(isValidWebhookUrl("https://myhost.local/webhook")).toBe(false);
    expect(isValidWebhookUrl("https://myhost.internal/webhook")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isValidWebhookUrl("not a url")).toBe(false);
  });
});

describe("hashApiKey", () => {
  it("returns a hex string", () => {
    const hash = hashApiKey("test-key");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    expect(hashApiKey("abc")).toBe(hashApiKey("abc"));
  });
});
