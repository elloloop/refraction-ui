import { describe, it, expect, vi } from "vitest";
import { RefractionTTSService, provideTTS } from "../src/tts.service";
import { createMockTTSProvider } from "@refraction-ui/ai";

describe("RefractionTTSService", () => {
  describe("constructor", () => {
    it("creates service with no config", () => {
      const service = new RefractionTTSService();
      expect(service).toBeDefined();
      expect(service.providers).toEqual([]);
      expect(service.isSpeaking).toBe(false);
    });

    it("creates service with config", () => {
      const service = new RefractionTTSService({ default: "browser" });
      expect(service).toBeDefined();
    });

    it("pre-registers providers from injection token", () => {
      const providerMap = {
        browser: createMockTTSProvider("browser"),
        elevenlabs: createMockTTSProvider("elevenlabs"),
      };
      const service = new RefractionTTSService(undefined, providerMap);
      expect(service.providers).toEqual(["browser", "elevenlabs"]);
    });

    it("accepts both config and providers", () => {
      const providerMap = {
        browser: createMockTTSProvider("browser"),
      };
      const service = new RefractionTTSService(
        { default: "browser" },
        providerMap,
      );
      expect(service.providers).toEqual(["browser"]);
    });
  });

  describe("provider management", () => {
    it("addProvider registers a provider", () => {
      const service = new RefractionTTSService();
      service.addProvider("browser", createMockTTSProvider("browser"));
      expect(service.providers).toContain("browser");
    });

    it("addProvider registers multiple providers", () => {
      const service = new RefractionTTSService();
      service.addProvider("browser", createMockTTSProvider("browser"));
      service.addProvider("elevenlabs", createMockTTSProvider("elevenlabs"));
      expect(service.providers).toEqual(["browser", "elevenlabs"]);
    });
  });

  describe("speak", () => {
    it("calls provider speak with text", () => {
      const service = new RefractionTTSService();
      const mockProvider = createMockTTSProvider("mock");
      service.addProvider("mock", mockProvider);
      service.speak("Hello world");
      expect(mockProvider.speakCalls.length).toBe(1);
      expect(mockProvider.speakCalls[0].text).toBe("Hello world");
    });

    it("sets isSpeaking to true when speaking", () => {
      const service = new RefractionTTSService();
      service.addProvider("mock", createMockTTSProvider("mock"));
      service.speak("Hello");
      expect(service.isSpeaking).toBe(true);
    });

    it("resets isSpeaking when onEnd is called", () => {
      const service = new RefractionTTSService();
      const mockProvider = createMockTTSProvider("mock");
      service.addProvider("mock", mockProvider);
      service.speak("Hello");
      expect(service.isSpeaking).toBe(true);

      // Simulate onEnd callback
      const callOpts = mockProvider.speakCalls[0].opts;
      callOpts?.onEnd?.();
      expect(service.isSpeaking).toBe(false);
    });

    it("calls user-provided onEnd callback", () => {
      const service = new RefractionTTSService();
      const mockProvider = createMockTTSProvider("mock");
      service.addProvider("mock", mockProvider);

      const userOnEnd = vi.fn();
      service.speak("Hello", { onEnd: userOnEnd });

      // Simulate onEnd callback
      const callOpts = mockProvider.speakCalls[0].opts;
      callOpts?.onEnd?.();
      expect(userOnEnd).toHaveBeenCalledTimes(1);
      expect(service.isSpeaking).toBe(false);
    });

    it("passes options through to provider", () => {
      const service = new RefractionTTSService();
      const mockProvider = createMockTTSProvider("mock");
      service.addProvider("mock", mockProvider);
      service.speak("Hello", { voice: "alloy", speed: 1.5 });

      const callOpts = mockProvider.speakCalls[0].opts;
      expect(callOpts?.voice).toBe("alloy");
      expect(callOpts?.speed).toBe(1.5);
    });
  });

  describe("stop", () => {
    it("calls provider stop", () => {
      const service = new RefractionTTSService();
      const mockProvider = createMockTTSProvider("mock");
      service.addProvider("mock", mockProvider);
      service.stop();
      expect(mockProvider.stopCalls).toBe(1);
    });

    it("resets isSpeaking to false", () => {
      const service = new RefractionTTSService();
      const mockProvider = createMockTTSProvider("mock");
      service.addProvider("mock", mockProvider);
      service.speak("Hello");
      expect(service.isSpeaking).toBe(true);
      service.stop();
      expect(service.isSpeaking).toBe(false);
    });
  });

  describe("default provider resolution", () => {
    it("uses default provider from config", () => {
      const service = new RefractionTTSService({ default: "elevenlabs" });
      const browserProvider = createMockTTSProvider("browser");
      const elevenlabsProvider = createMockTTSProvider("elevenlabs");
      service.addProvider("browser", browserProvider);
      service.addProvider("elevenlabs", elevenlabsProvider);
      service.speak("Hello");
      expect(elevenlabsProvider.speakCalls.length).toBe(1);
      expect(browserProvider.speakCalls.length).toBe(0);
    });

    it("uses first provider when no default configured", () => {
      const service = new RefractionTTSService();
      const browserProvider = createMockTTSProvider("browser");
      const elevenlabsProvider = createMockTTSProvider("elevenlabs");
      service.addProvider("browser", browserProvider);
      service.addProvider("elevenlabs", elevenlabsProvider);
      service.speak("Hello");
      expect(browserProvider.speakCalls.length).toBe(1);
      expect(elevenlabsProvider.speakCalls.length).toBe(0);
    });
  });
});

describe("provideTTS", () => {
  it("returns an array of providers", () => {
    const providers = provideTTS();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it("accepts config and provider map", () => {
    const providers = provideTTS(
      { default: "browser" },
      { browser: createMockTTSProvider("browser") },
    );
    expect(Array.isArray(providers)).toBe(true);
  });
});
