---
"@refraction-ui/react-input": patch
---

Document the deliberate `size`-prop shadowing on `<Input>`. The component intentionally shadows the native HTML `size` attribute (which controls visible character width) to expose a visual `size` prop accepting `'sm' | 'default' | 'lg'`. Added a TSDoc block to the prop and a "Sizing" section to the package README explaining the trade-off and how to access the native attribute via a `ref` if needed.
