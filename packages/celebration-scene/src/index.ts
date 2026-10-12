/** Stable, bounded decorative scene recipes. No random state or message copy. */
export const celebrationSceneStyles = ["confetti", "fireworks", "star-trail", "heart-bloom", "paper-plane", "rocket", "sunrise", "garden", "ribbons", "bubbles", "high-five", "sparkles", "comet", "lanterns", "waves", "pinwheel", "balloons", "music", "trophy", "orbit"] as const
export type CelebrationSceneStyle = typeof celebrationSceneStyles[number]
const paths = ["M35 35l30 10-20 20z M48 28l3-9 M65 31l8-5 M71 48l10 1", "M50 15v15 M50 70v15 M15 50h15 M70 50h15 M25 25l10 10 M65 65l10 10 M25 75l10-10 M65 35l10-10", "M50 18l10 21 23 3-17 17 4 24-20-12-20 12 4-24-17-17 23-3z", "M50 76C10 51 19 22 36 26q10 0 14 12q4-12 14-12c17-4 26 25-14 50z", "M18 43l66-24-24 65-11-26z M49 58l35-39", "M40 60q-6-30 26-43q6 34-13 48z M38 49l-11 5-4 19 18-9 M55 65l-4 15-17 4 5-20 M32 71l-9 10 M49 38a5 5 0 1 0 10 0a5 5 0 1 0-10 0", "M20 65h60 M30 64a20 20 0 0 1 40 0 M50 19v10 M20 37l8 8 M72 45l8-8", "M50 80V48 M50 58q-25 0-22-20q22 1 22 20 M50 68q25 0 22-20q-22 1-22 20 M50 46a13 13 0 1 0 0-26a13 13 0 1 0 0 26", "M30 25q40 0 40 25q-40 0-40 25 M35 25l-10 50 M65 25l10 50", "M37 52a15 15 0 1 0 0-30a15 15 0 1 0 0 30 M67 72a10 10 0 1 0 0-20a10 10 0 1 0 0 20", "M35 70V38q0-8 7-8v25-32q0-8 7-8v38-29q0-8 7-8v38-25q0-8 7-8v27l7-10q8-6 10 4L65 80H42z", "M50 20l8 23 22 7-22 8-8 22-8-22-22-8 22-7z", "M20 30l35 20 M20 48l28 15 M32 22l30 19 M68 72a18 18 0 1 0 0-36a18 18 0 1 0 0 36", "M35 25h30l5 35-20 17-20-17z M50 77v10 M38 20h24 M36 38h28", "M15 35q15-18 30 0t30 0 M15 52q15-18 30 0t30 0 M15 69q15-18 30 0t30 0", "M50 50l-30-25q35-10 30 25l30-25q10 35-30 25l30 25q-35 10-30-25l-30 25q-10-35 30-25 M50 50v35", "M50 58c-27-10-20-42 0-42s27 32 0 42 M50 58q-8 8 2 16t0 17", "M44 66V23l29-8v42 M44 66c0 10-22 12-22 3s22-13 22-3 M73 57c0 10-22 12-22 3s22-13 22-3", "M32 20h36v22q0 25-18 25T32 42z M32 25H20q0 25 16 25 M68 25h12q0 25-16 25 M50 67v15 M35 82h30", "M50 70a20 20 0 1 0 0-40a20 20 0 1 0 0 40 M20 60q20-50 60-20t-60 20"]
export const celebrationSceneDurationMs = 2400
export const celebrationSceneCSS = `
.rui-celebration-scene{height:132px;color:hsl(var(--primary));overflow:hidden}
.rui-celebration-stage{width:100%;height:100%}
.rui-celebration-scene svg{width:100%;height:100%}
.rui-celebration-scene path{stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;fill:none}
.rui-celebration-dot{fill:currentColor;opacity:.65}
@keyframes rui-celebration-enter{0%{translate:-45px 0;rotate:-20deg;scale:.65}40%{translate:0 -16px;rotate:12deg;scale:1.05}70%{translate:0 3px;rotate:-3deg}100%{translate:0 0;rotate:0deg;scale:1}}
@keyframes rui-celebration-scatter{0%{translate:0 20px;scale:.1;opacity:0}45%{translate:0 -8px;scale:1.1;opacity:.9}100%{translate:0 0;scale:1;opacity:.65}}
@media(prefers-reduced-motion:no-preference){.rui-celebration-scene[data-animate=true] .rui-celebration-hero{transform-origin:150px 65px;animation:rui-celebration-enter 2400ms ease-out both}.rui-celebration-scene[data-animate=true] .rui-celebration-dot{transform-box:fill-box;transform-origin:center;animation:rui-celebration-scatter 2100ms ease-out var(--scene-delay) both}}
@media(prefers-reduced-motion:reduce){.rui-celebration-hero,.rui-celebration-dot{animation:none!important}}
`
export function celebrationSceneSVG(style: CelebrationSceneStyle): string {
  const index = celebrationSceneStyles.indexOf(style)
  if(index < 0) throw new Error(`Unknown celebration style: ${style}`)
  const particles = Array.from({length:14},(_,i)=>{
    const phase=i*Math.PI*2/14
    const x=150+Math.cos(phase)*110, y=65+Math.sin(phase)*45
    return `<circle class="rui-celebration-dot" cx="${x}" cy="${y}" r="${i%3+2}" style="--scene-delay:${i*20}ms"/>`
  }).join('')
  return `<svg viewBox="0 0 300 130" aria-hidden="true" focusable="false">${particles}<g class="rui-celebration-hero" transform="translate(100 15)"><path d="${paths[index]}"/></g></svg>`
}
