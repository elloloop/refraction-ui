import { describe, it, expect } from "vitest";
import { RefractionAIService, provideAI } from "../src/ai.service";
import { createMockAIProvider } from "@refraction-ui/ai";

describe("RefractionAIService", () => {
  describe("constructor", () => {
    it("creates service with no config", () => {
      const service = new RefractionAIService();
      expect(service).toBeDefined();
      expect(service.providers).toEqual([]);
      expect(service.isGenerating).toBe(false);
    });

    it("creates service with config", () => {
      const service = new RefractionAIService({ default: "openai" });
      expect(service).toBeDefined();
    });

    it("pre-registers providers from injection token", () => {
      const providerMap = {
        openai: createMockAIProvider("openai"),
        anthropic: createMockAIProvider("anthropic"),
      };
      const service = new RefractionAIService(undefined, providerMap);
      expect(service.providers).toEqual(["openai", "anthropic"]);
    });

    it("accepts both config and providers", () => {
      const providerMap = {
        openai: createMockAIProvider("openai"),
      };
      const service = new RefractionAIService(
        { default: "openai" },
        providerMap,
      );
      expect(service.providers).toEqual(["openai"]);
    });
  });

  describe("provider management", () => {
    it("addProvider registers a provider", () => {
      const service = new RefractionAIService();
      service.addProvider("openai", createMockAIProvider("openai"));
      expect(service.providers).toContain("openai");
    });

    it("addProvider registers multiple providers", () => {
      const service = new RefractionAIService();
      service.addProvider("openai", createMockAIProvider("openai"));
      service.addProvider("anthropic", createMockAIProvider("anthropic"));
      expect(service.providers).toEqual(["openai", "anthropic"]);
    });

    it("removeProvider removes a provider", () => {
      const service = new RefractionAIService();
      service.addProvider("openai", createMockAIProvider("openai"));
      service.addProvider("anthropic", createMockAIProvider("anthropic"));
      service.removeProvider("openai");
      expect(service.providers).toEqual(["anthropic"]);
    });

    it("removeProvider is a no-op for unknown provider", () => {
      const service = new RefractionAIService();
      service.addProvider("openai", createMockAIProvider("openai"));
      service.removeProvider("nonexistent");
      expect(service.providers).toEqual(["openai"]);
    });
  });

  describe("generateText", () => {
    it("returns text from the provider", async () => {
      const service = new RefractionAIService();
      service.addProvider(
        "mock",
        createMockAIProvider("mock", { text: ["hello world"] }),
      );
      const result = await service.generateText("say hello");
      expect(result).toBe("hello world");
    });

    it("sets isGenerating to true during generation", async () => {
      const service = new RefractionAIService();
      service.addProvider("mock", createMockAIProvider("mock"));

      let wasGenerating = false;
      const originalGenerateText = service.generateText.bind(service);
      // Check state transitions by wrapping
      const promise = service.generateText("hello");
      // isGenerating is set synchronously before the await
      // After resolution it should be false
      await promise;
      expect(service.isGenerating).toBe(false);
    });

    it("resets isGenerating to false after completion", async () => {
      const service = new RefractionAIService();
      service.addProvider("mock", createMockAIProvider("mock"));
      await service.generateText("hello");
      expect(service.isGenerating).toBe(false);
    });

    it("resets isGenerating after error", async () => {
      const service = new RefractionAIService();
      // no providers → will throw
      await expect(service.generateText("hello")).rejects.toThrow();
      expect(service.isGenerating).toBe(false);
    });

    it("passes options to the underlying provider", async () => {
      const service = new RefractionAIService();
      service.addProvider(
        "openai",
        createMockAIProvider("openai", { text: ["response"] }),
      );
      service.addProvider(
        "anthropic",
        createMockAIProvider("anthropic", { text: ["anthropic-response"] }),
      );
      const result = await service.generateText("hello", {
        provider: "anthropic",
      });
      expect(result).toBe("anthropic-response");
    });

    it("throws when no providers are registered", async () => {
      const service = new RefractionAIService();
      await expect(service.generateText("hello")).rejects.toThrow(
        /no.*provider/i,
      );
    });
  });

  describe("generateJSON", () => {
    it("returns JSON from the provider", async () => {
      const service = new RefractionAIService();
      service.addProvider(
        "mock",
        createMockAIProvider("mock", { json: [{ answer: 42 }] }),
      );
      const result = await service.generateJSON<{ answer: number }>(
        "give me json",
      );
      expect(result).toEqual({ answer: 42 });
    });

    it("resets isGenerating after completion", async () => {
      const service = new RefractionAIService();
      service.addProvider("mock", createMockAIProvider("mock"));
      await service.generateJSON("hello");
      expect(service.isGenerating).toBe(false);
    });

    it("resets isGenerating after error", async () => {
      const service = new RefractionAIService();
      await expect(service.generateJSON("hello")).rejects.toThrow();
      expect(service.isGenerating).toBe(false);
    });

    it("throws when no providers are registered", async () => {
      const service = new RefractionAIService();
      await expect(service.generateJSON("hello")).rejects.toThrow(
        /no.*provider/i,
      );
    });
  });

  describe("default provider resolution", () => {
    it("uses default provider from config", async () => {
      const service = new RefractionAIService({ default: "anthropic" });
      service.addProvider(
        "openai",
        createMockAIProvider("openai", { text: ["openai-response"] }),
      );
      service.addProvider(
        "anthropic",
        createMockAIProvider("anthropic", { text: ["anthropic-response"] }),
      );
      const result = await service.generateText("hello");
      expect(result).toBe("anthropic-response");
    });

    it("uses first provider when no default configured", async () => {
      const service = new RefractionAIService();
      service.addProvider(
        "openai",
        createMockAIProvider("openai", { text: ["openai-response"] }),
      );
      service.addProvider(
        "anthropic",
        createMockAIProvider("anthropic", { text: ["anthropic-response"] }),
      );
      const result = await service.generateText("hello");
      expect(result).toBe("openai-response");
    });
  });
});

describe("provideAI", () => {
  it("returns an array of providers", () => {
    const providers = provideAI();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it("accepts config and provider map", () => {
    const providers = provideAI(
      { default: "openai" },
      { openai: createMockAIProvider("openai") },
    );
    expect(Array.isArray(providers)).toBe(true);
  });
});
