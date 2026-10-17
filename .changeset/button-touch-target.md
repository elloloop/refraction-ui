---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Add an opt-in `touchTarget` prop to Button. It grows the clickable area to at least 44×44 CSS px (the WCAG 2.5.5 target size, and larger when the reader's root text size is larger) with an invisible centred pseudo-element, so the small icon sizes (`icon`, `icon-sm`, `icon-xs`) can meet the target without changing how the button looks or the space it takes. It is off by default, so existing layouts do not shift. The button gets `data-touch-target`, and the class string is exported from the core as `buttonTouchTargetStyles` for custom controls. Keep neighbouring targets' centres at least 44px apart; an ancestor with `overflow: hidden` clips the extension.
