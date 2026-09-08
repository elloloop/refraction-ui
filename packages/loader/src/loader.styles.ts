import { cva } from '@refraction-ui/shared'

/**
 * Spinner root. Geometry (box size, stroke) is driven by `data-size` in the
 * stylesheet so it renders identically with or without Tailwind; these classes
 * carry colour and layout only.
 */
export const spinnerVariants = cva({
  base: 'relative inline-flex shrink-0 items-center justify-center align-middle',
  variants: {
    tone: {
      primary: 'text-primary',
      tertiary: 'text-tertiary',
      muted: 'text-muted-foreground',
      inverse: 'text-primary-foreground',
      current: 'text-current',
    },
  },
  defaultVariants: {
    tone: 'primary',
  },
})

/** Top-of-page / inline progress bar root. */
export const loadingBarVariants = cva({
  base: 'block w-full overflow-hidden',
  variants: {
    tone: {
      primary: 'text-primary',
      tertiary: 'text-tertiary',
      muted: 'text-muted-foreground',
      inverse: 'text-primary-foreground',
      current: 'text-current',
    },
    placement: {
      fixed: 'fixed inset-x-0 top-0 z-[9999] rounded-none',
      inline: 'relative rounded-pill bg-muted',
    },
  },
  defaultVariants: {
    tone: 'primary',
    placement: 'inline',
  },
})

/** Scrim that blocks a loading region. */
export const loadingOverlayVariants = cva({
  base: 'flex flex-col items-center justify-center gap-4 text-center',
  variants: {
    scope: {
      fullscreen: 'fixed inset-0 z-[9998]',
      contain: 'absolute inset-0 z-50 rounded-[inherit]',
    },
  },
  defaultVariants: {
    scope: 'fullscreen',
  },
})

/** Text under an overlay. */
export const loaderMessageClass = 'text-sm font-medium text-foreground'

/**
 * Keyframes and geometry for every loader, scoped by `[data-rfr-loader]`.
 *
 * Injected once per page by adapters (React hoists it via `<style precedence>`;
 * Astro inlines it). Colour always comes from `currentColor` or theme tokens so
 * the sheet is theme-agnostic. Under `prefers-reduced-motion` every loop
 * collapses to a slow opacity pulse — still a loading signal, never motion.
 */
export const loaderStyles = `
[data-rfr-loader]{box-sizing:border-box;--rfr-loader-speed:1}
[data-rfr-loader] *,[data-rfr-loader] *::before,[data-rfr-loader] *::after{box-sizing:border-box}

/* ---- Spinner geometry ------------------------------------------------- */
[data-rfr-loader="spinner"]{width:var(--_size);height:var(--_size);--_size:1.5rem;--_stroke:3px}
[data-rfr-loader="spinner"][data-size="xs"]{--_size:0.75rem;--_stroke:2px}
[data-rfr-loader="spinner"][data-size="sm"]{--_size:1rem;--_stroke:2px}
[data-rfr-loader="spinner"][data-size="md"]{--_size:1.5rem;--_stroke:3px}
[data-rfr-loader="spinner"][data-size="lg"]{--_size:2.25rem;--_stroke:3px}
[data-rfr-loader="spinner"][data-size="xl"]{--_size:3.5rem;--_stroke:4px}
[data-rfr-loader="spinner"] [data-part]{display:block}

/* ring: faint track + comet arc */
[data-rfr-loader="spinner"][data-variant="ring"]::before{content:"";position:absolute;inset:0;border-radius:50%;border:var(--_stroke) solid currentColor;opacity:.18}
[data-rfr-loader="spinner"][data-variant="ring"] [data-part]{position:absolute;inset:0;border-radius:50%;border:var(--_stroke) solid transparent;border-top-color:currentColor;border-right-color:color-mix(in oklab,currentColor 45%,transparent);animation:rfr-loader-spin calc(.85s/var(--rfr-loader-speed)) cubic-bezier(.5,.15,.5,.85) infinite}

/* dots: three pebbles breathing in sequence */
[data-rfr-loader="spinner"][data-variant="dots"]{gap:calc(var(--_size)*.14)}
[data-rfr-loader="spinner"][data-variant="dots"] [data-part]{width:calc(var(--_size)*.26);height:calc(var(--_size)*.26);border-radius:50%;background:currentColor;animation:rfr-loader-dot calc(1.1s/var(--rfr-loader-speed)) ease-in-out infinite}
[data-rfr-loader="spinner"][data-variant="dots"] [data-part="1"]{animation-delay:.16s}
[data-rfr-loader="spinner"][data-variant="dots"] [data-part="2"]{animation-delay:.32s}

/* bars: an equaliser, calm not thumping */
[data-rfr-loader="spinner"][data-variant="bars"]{gap:calc(var(--_size)*.12)}
[data-rfr-loader="spinner"][data-variant="bars"] [data-part]{width:calc(var(--_size)*.16);height:100%;border-radius:999px;background:currentColor;transform-origin:center;animation:rfr-loader-bar calc(1s/var(--rfr-loader-speed)) ease-in-out infinite}
[data-rfr-loader="spinner"][data-variant="bars"] [data-part="1"]{animation-delay:.12s}
[data-rfr-loader="spinner"][data-variant="bars"] [data-part="2"]{animation-delay:.24s}
[data-rfr-loader="spinner"][data-variant="bars"] [data-part="3"]{animation-delay:.36s}

/* orbit: three satellites on different periods */
[data-rfr-loader="spinner"][data-variant="orbit"]::before{content:"";position:absolute;inset:0;border-radius:50%;border:1px solid currentColor;opacity:.15}
[data-rfr-loader="spinner"][data-variant="orbit"] [data-part]{position:absolute;inset:0;animation:rfr-loader-spin calc(1.2s/var(--rfr-loader-speed)) linear infinite}
[data-rfr-loader="spinner"][data-variant="orbit"] [data-part]::before{content:"";position:absolute;top:calc(var(--_stroke)*-.5);left:50%;width:calc(var(--_stroke)*1.6);height:calc(var(--_stroke)*1.6);margin-left:calc(var(--_stroke)*-.8);border-radius:50%;background:currentColor}
[data-rfr-loader="spinner"][data-variant="orbit"] [data-part="1"]{animation-duration:calc(1.8s/var(--rfr-loader-speed));opacity:.7}
[data-rfr-loader="spinner"][data-variant="orbit"] [data-part="2"]{animation-duration:calc(2.6s/var(--rfr-loader-speed));opacity:.4}

/* ripple: two rings blooming from the centre */
[data-rfr-loader="spinner"][data-variant="ripple"] [data-part]{position:absolute;inset:0;border-radius:50%;border:var(--_stroke) solid currentColor;opacity:0;animation:rfr-loader-ripple calc(1.6s/var(--rfr-loader-speed)) cubic-bezier(.2,.6,.4,1) infinite}
[data-rfr-loader="spinner"][data-variant="ripple"] [data-part="1"]{animation-delay:.8s}

/* ---- Loading bar ------------------------------------------------------- */
[data-rfr-loader="bar"]{height:var(--rfr-loader-bar-height,3px);position:relative;overflow:hidden}
[data-rfr-loader="bar"][data-placement="fixed"]{pointer-events:none}
[data-rfr-loader="bar"] [data-part="fill"]{position:absolute;top:0;bottom:0;left:0;width:var(--rfr-loader-value,0%);border-radius:inherit;background:currentColor;transition:width .25s cubic-bezier(.22,.61,.36,1),opacity .3s ease-out}
[data-rfr-loader="bar"] [data-part="fill"]::after{content:"";position:absolute;right:0;top:0;bottom:0;width:6rem;max-width:60%;border-radius:inherit;box-shadow:0 0 10px currentColor,0 0 2px currentColor;opacity:.6}
[data-rfr-loader="bar"][data-state="indeterminate"] [data-part="fill"]{width:38%;transition:none;animation:rfr-loader-bar-sweep calc(1.4s/var(--rfr-loader-speed)) cubic-bezier(.4,0,.2,1) infinite}
[data-rfr-loader="bar"][data-state="complete"] [data-part="fill"]{opacity:0;transition-delay:0s,.25s}
[data-rfr-loader="bar"][data-state="complete"] [data-part="fill"]::after{display:none}

/* ---- Overlay ----------------------------------------------------------- */
[data-rfr-loader="overlay"]{background:hsl(var(--background)/.78);animation:rfr-loader-fade-in .2s ease-out both}
[data-rfr-loader="overlay"][data-blur="true"]{-webkit-backdrop-filter:blur(var(--rfr-loader-blur,6px));backdrop-filter:blur(var(--rfr-loader-blur,6px))}
[data-rfr-loader="overlay"] [data-part="panel"]{display:flex;flex-direction:column;align-items:center;gap:1rem;animation:rfr-loader-rise .32s cubic-bezier(.16,.84,.24,1) both}

/* ---- Keyframes --------------------------------------------------------- */
@keyframes rfr-loader-spin{to{transform:rotate(360deg)}}
@keyframes rfr-loader-dot{0%,80%,100%{transform:scale(.55);opacity:.35}40%{transform:scale(1);opacity:1}}
@keyframes rfr-loader-bar{0%,100%{transform:scaleY(.35);opacity:.45}50%{transform:scaleY(1);opacity:1}}
@keyframes rfr-loader-ripple{0%{transform:scale(.15);opacity:.9}100%{transform:scale(1);opacity:0}}
@keyframes rfr-loader-bar-sweep{0%{left:-40%}60%{left:100%}100%{left:100%}}
@keyframes rfr-loader-fade-in{from{opacity:0}to{opacity:1}}
@keyframes rfr-loader-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes rfr-loader-pulse{0%,100%{opacity:1}50%{opacity:.45}}

/* ---- Reduced motion: a slow pulse, never a loop of movement ------------ */
@media (prefers-reduced-motion:reduce){
  [data-rfr-loader] [data-part],[data-rfr-loader] [data-part]::before,[data-rfr-loader] [data-part]::after,
  [data-rfr-loader="overlay"],[data-rfr-loader="overlay"] [data-part="panel"]{animation:none!important;transform:none!important}
  [data-rfr-loader="spinner"],[data-rfr-loader="bar"][data-state="indeterminate"] [data-part="fill"]{animation:rfr-loader-pulse 2s ease-in-out infinite!important}
  [data-rfr-loader="bar"][data-state="indeterminate"] [data-part="fill"]{width:100%;left:0}
  [data-rfr-loader] *{transition:none!important}
}
`
