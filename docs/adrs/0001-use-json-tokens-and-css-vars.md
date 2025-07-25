# 0001: Use JSON tokens and CSS variables

- Status: Accepted
- Context: We need a format that design tools can export and build tools can consume. Style Dictionary and Figma Tokens export JSON. We want runtime theme switching without rebuild.
- Decision: Store tokens in JSON, validate with Zod. Compile to CSS variables for runtime use. Tailwind plugin reads the same source.
- Consequences:
  - Easy import from design tools.
  - Runtime switch is possible by swapping root CSS var sets.
  - Slight overhead of many CSS vars, mitigated by scoping and minification.
