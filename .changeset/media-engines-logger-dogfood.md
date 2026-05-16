---
"@refraction-ui/media-engines": patch
---

Dogfood `@refraction-ui/logger`: `media-engines` now backs its logger with the shared telemetry core (categories → scoped child loggers, `measurePerformance` → spans). Public types and behavior (`createLogger`, `createScopedLogger`, `LogLevel`, `LogCategory`, `LogEntry`, `getEntries`, `clear`) are unchanged.
