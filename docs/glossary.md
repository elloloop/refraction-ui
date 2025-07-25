# Glossary

**Adapter (engine adapter)**  
Maps our canonical component API to an underlying behavior library (Radix, Headless UI, etc.).

**Component template**  
Folder of source files (TSX, tests, stories, MDX) plus `meta.json` used by the CLI to generate code.

**Engine**  
Behavior implementation for a component. Values: `internal`, `radix`, `headlessui` (extensible).

**Flow**  
Multi-page or multi-component UX scaffold (e.g., auth, settings) the CLI can generate.

**MCP (Model Context Protocol) server**  
JSON-RPC service exposing generators, audits, and docs so IDEs/LLMs can call them.

**Token**  
Named design value. Three levels: global, semantic, component. Stored in `refraction-tokens.json`.

**Token build**  
Turns tokens into CSS variables and Tailwind fragments.

**Theme / Mode**  
Theme = named brand (e.g., `default`, `acme`).  
Mode = light/dark variant inside a theme.

**Upgrade**  
Applying a newer template version to an existing user file using diff/patch.

**Variant**  
Styling or behavioral option on a component (size, intent). Implemented with class-variance-authority-style objects.

**.refractionrc**  
Project config telling the CLI where to write files, default engine, paths, etc.
