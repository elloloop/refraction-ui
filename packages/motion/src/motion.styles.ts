import { cva } from '@refraction-ui/shared'
import { MOTION_DURATIONS, MOTION_EASINGS } from './motion.js'

/** Root of a staggered group. */
export const staggerVariants = cva({
  base: '',
  variants: {
    layout: {
      stack: 'flex flex-col',
      grid: 'grid',
      inline: 'flex flex-wrap',
      none: '',
    },
  },
  defaultVariants: {
    layout: 'none',
  },
})

/** Container that holds the transitioning page; clips the incoming slide. */
export const pageTransitionClass = 'relative'

const d = MOTION_DURATIONS
const e = MOTION_EASINGS

/**
 * Every duration and delay is divided by `--rfr-motion-speed`, so one custom
 * property re-times the whole choreography without touching a keyframe.
 * The fallback keeps the sheet correct if the property is never set.
 */
const dur = (name: string) => `calc(var(--rfr-motion-${name}) / var(--rfr-motion-speed,1))`
const DELAY = 'calc(var(--rfr-motion-delay,0ms) / var(--rfr-motion-speed,1))'

/**
 * Keyframes and pattern rules, scoped by `[data-rfr-motion]`. Injected once by
 * adapters. Every animation uses `both` fill so the element holds its final
 * frame; every rule collapses under `prefers-reduced-motion` so content simply
 * appears — the transitions are inert, never replaced by another movement.
 */
export const motionStyles = `
[data-rfr-motion]{--rfr-motion-delay:0ms;--rfr-motion-speed:1;--rfr-motion-page:${d.page}ms;--rfr-motion-base:${d.base}ms;--rfr-motion-slow:${d.slow}ms;--rfr-motion-sheet:${d.sheet}ms;--rfr-motion-celebrate:${d.celebrate}ms;--rfr-motion-nudge:1600ms;--rfr-motion-icon:260ms;--rfr-motion-num:320ms;--rfr-motion-ease-out:${e.out};--rfr-motion-ease-in-out:${e.inOut};--rfr-motion-ease-emphasis:${e.emphasis};--rfr-motion-ease-bounce:${e.bounce}}
[data-rfr-motion="reveal"]{animation-delay:${DELAY};animation-fill-mode:both}
[data-rfr-motion="reveal"][data-pattern="page-in"]{animation:rfr-motion-page-in ${dur('page')} var(--rfr-motion-ease-emphasis) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="page-back"]{animation:rfr-motion-page-back ${dur('page')} var(--rfr-motion-ease-emphasis) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="side-next"]{animation:rfr-motion-side-next ${dur('page')} var(--rfr-motion-ease-emphasis) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="side-prev"]{animation:rfr-motion-side-prev ${dur('page')} var(--rfr-motion-ease-emphasis) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="fold-in"]{animation:rfr-motion-fold-in ${dur('page')} var(--rfr-motion-ease-out) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="sheet-in"]{animation:rfr-motion-sheet-in ${dur('sheet')} var(--rfr-motion-ease-emphasis) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="scrim-in"]{animation:rfr-motion-fade-in ${dur('sheet')} var(--rfr-motion-ease-out) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="handoff"]{animation:rfr-motion-handoff ${dur('page')} var(--rfr-motion-ease-emphasis) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="celebrate"]{animation:rfr-motion-celebrate ${dur('celebrate')} var(--rfr-motion-ease-bounce) ${DELAY} 1 both}
[data-rfr-motion="reveal"][data-pattern="grow"]{transform-origin:left center;animation:rfr-motion-grow ${dur('slow')} var(--rfr-motion-ease-out) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="nudge"]{animation:rfr-motion-nudge ${dur('nudge')} var(--rfr-motion-ease-in-out) ${DELAY} 2}
[data-rfr-motion="reveal"][data-pattern="icon-swap"]{animation:rfr-motion-icon-swap ${dur('icon')} var(--rfr-motion-ease-emphasis) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="num-pop"]{animation:rfr-motion-num-pop ${dur('num')} var(--rfr-motion-ease-bounce) ${DELAY} both}
[data-rfr-motion="reveal"][data-pattern="check-draw"]{stroke-dasharray:1;stroke-dashoffset:1;animation:rfr-motion-check-draw ${dur('slow')} var(--rfr-motion-ease-out) calc((var(--rfr-motion-delay) + 60ms) / var(--rfr-motion-speed,1)) both}
[data-rfr-motion="reveal"][data-disabled="true"]{animation:none!important;stroke-dashoffset:0}

/* Staggered group: each child arrives after the previous, 45ms apart, capped at eight. */
[data-rfr-motion="stagger"]>*{animation:rfr-motion-page-in ${dur('base')} var(--rfr-motion-ease-emphasis) ${DELAY} both}
[data-rfr-motion="stagger"][data-pattern="side-next"]>*{animation-name:rfr-motion-side-next}
[data-rfr-motion="stagger"][data-pattern="handoff"]>*{animation-name:rfr-motion-handoff}
[data-rfr-motion="stagger"][data-pattern="celebrate"]>*{animation-name:rfr-motion-celebrate;animation-duration:${dur('celebrate')};animation-timing-function:var(--rfr-motion-ease-bounce)}
[data-rfr-motion="stagger"][data-disabled="true"]>*{animation:none!important}

@keyframes rfr-motion-page-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes rfr-motion-page-back{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
@keyframes rfr-motion-side-next{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}
@keyframes rfr-motion-side-prev{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}
@keyframes rfr-motion-fold-in{from{opacity:0;transform:translateX(26px) scale(.97)}to{opacity:1;transform:none}}
@keyframes rfr-motion-sheet-in{from{transform:translateY(101%)}to{transform:none}}
@keyframes rfr-motion-fade-in{from{opacity:0}to{opacity:1}}
@keyframes rfr-motion-handoff{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:none}}
@keyframes rfr-motion-celebrate{0%{opacity:0;transform:scale(.5) rotate(-8deg)}60%{opacity:1}100%{opacity:1;transform:none}}
@keyframes rfr-motion-grow{from{transform:scaleX(0)}to{transform:none}}
@keyframes rfr-motion-nudge{0%,100%{transform:none}50%{transform:translateY(-4px)}}
@keyframes rfr-motion-icon-swap{from{opacity:0;transform:scale(.72);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
@keyframes rfr-motion-num-pop{from{opacity:0;transform:translateY(9px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
@keyframes rfr-motion-check-draw{to{stroke-dashoffset:0}}

/* Inert under reduced motion: content appears in place, nothing moves. */
@media (prefers-reduced-motion:reduce){
  [data-rfr-motion="reveal"],[data-rfr-motion="stagger"]>*{animation:none!important}
  [data-rfr-motion="reveal"][data-pattern="check-draw"]{stroke-dashoffset:0}
}
`
