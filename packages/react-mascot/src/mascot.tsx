import * as React from 'react'
import {
  createMascot,
  startMascotBlinkInterval,
  mascotVariants,
  type MascotMood,
  type MascotAnimation,
  type MascotSize,
} from '@refraction-ui/mascot'
import { cn } from '@refraction-ui/shared'

export type { MascotMood, MascotAnimation, MascotSize }

export interface MascotProps extends Omit<React.SVGProps<SVGSVGElement>, 'size'> {
  /** The mood of the mascot. Defaults to 'happy'. */
  mood?: MascotMood
  /** The active animation style. Defaults to 'none'. */
  animation?: MascotAnimation
  /** The size class of the mascot. Defaults to 'md'. */
  size?: MascotSize
  /** Master switch for all animations. Defaults to true. */
  animate?: boolean
  /** Whether the bobbing animation is enabled. Defaults to null, falling back to animate. */
  animateBobbing?: boolean
  /** Whether the blinking timer animation is enabled. Defaults to null, falling back to animate. */
  animateBlinking?: boolean
  /** Whether the sprout swaying animation is enabled. Defaults to null, falling back to animate. */
  animateSprout?: boolean
}

/**
 * Mascot component displaying Tobi the tortoise.
 *
 * Supports three moods ('happy', 'think', and 'wave') and toggleable animations
 * (breathing bobbing, blinking timers, sprout swaying).
 * States and theme styling are driven by the headless core `@refraction-ui/mascot`.
 */
export const Mascot = React.forwardRef<SVGSVGElement, MascotProps>(
  (
    {
      mood = 'happy',
      animation = 'none',
      size = 'md',
      animate = true,
      animateBobbing,
      animateBlinking,
      animateSprout,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const [isBlinking, setIsBlinking] = React.useState(false)

    const shouldBob = animateBobbing ?? animate
    const shouldSway = animateSprout ?? animate
    const shouldBlink = animateBlinking ?? animate

    React.useEffect(() => {
      if (!shouldBlink) {
        setIsBlinking(false)
        return
      }
      const cleanup = startMascotBlinkInterval(setIsBlinking)
      return cleanup
    }, [shouldBlink])

    const api = createMascot({ mood, animation, size, animate })

    // Merge core mood variables with user styles
    const combinedStyle: React.CSSProperties = {
      ...api.style,
      ...style,
    }

    return (
      <svg
        ref={ref}
        className={cn('mascot', mascotVariants({ size, animation }), className)}
        viewBox="0 0 340 300"
        xmlns="http://www.w3.org/2000/svg"
        style={combinedStyle}
        {...api.ariaProps}
        {...api.dataAttributes}
        data-blinking={isBlinking ? 'true' : 'false'}
        data-bobbing={shouldBob ? 'true' : 'false'}
        data-sprout={shouldSway ? 'true' : 'false'}
        data-waving={animate ? 'true' : 'false'}
        {...props}
      >
        <defs>
          <style>
            {`
              /* Base styles and fallback HSL values */
              svg.mascot {
                --primary: 138 60% 51%;
                --primary-200: 138 60% 83%;
                --primary-300: 138 59% 74%;
                --primary-400: 138 59% 63%;
                --primary-600: 138 58% 43%;
                --primary-700: 138 58% 36%;
                --primary-800: 138 58% 29%;
                --primary-900: 138 58% 22%;
                --primary-950: 139 59% 16%;
                --sunshine: 42 100% 62%;
                --accent-solid: 26 100% 67%;

                fill: none;
                stroke-linecap: round;
                stroke-linejoin: round;
              }

              /* Mapping elements to tokens */
              svg.mascot .shadow {
                fill: hsl(var(--primary-900) / 0.15);
              }
              svg.mascot .stem {
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
                fill: none;
              }
              svg.mascot .leaf {
                fill: hsl(var(--rfr-mascot-leaf, var(--primary-400)));
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
              }
              svg.mascot .skin-d {
                fill: hsl(var(--rfr-mascot-skin-d, var(--primary-400)));
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
              }
              svg.mascot .skin {
                fill: hsl(var(--rfr-mascot-skin, var(--primary-300)));
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
              }
              svg.mascot .shell-rim {
                fill: hsl(var(--rfr-mascot-shell-rim, var(--primary-800)));
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
              }
              svg.mascot .shell {
                fill: hsl(var(--rfr-mascot-shell, var(--primary-600)));
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
              }
              svg.mascot .belly {
                fill: hsl(var(--rfr-mascot-belly, var(--primary-200)));
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
              }
              svg.mascot .scute {
                fill: hsl(var(--rfr-mascot-scute, var(--primary-700)));
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 2.5px;
              }
              svg.mascot .scute.alt {
                fill: hsl(var(--rfr-mascot-scute-alt, var(--primary-800)));
              }
              svg.mascot .ln {
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
                fill: none;
              }
              svg.mascot .eye-w {
                fill: #ffffff;
                stroke: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
                stroke-width: 3px;
              }
              svg.mascot .pupil {
                fill: hsl(var(--rfr-mascot-stroke, var(--primary-950)));
              }
              svg.mascot .glint {
                fill: #ffffff;
              }
              svg.mascot .cheek {
                fill: hsl(var(--rfr-mascot-cheek, var(--accent-solid)));
              }

              /* Float Animation keyframes */
              @keyframes rfrMascotFloat {
                0%, 100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-8px);
                }
              }

              /* Sway/antenna animation keyframes */
              @keyframes rfrMascotSway {
                0%, 100% {
                  transform: rotate(0deg);
                }
                50% {
                  transform: rotate(4deg);
                }
              }

              /* Waving animation keyframes */
              @keyframes rfrMascotWave {
                0%, 100% {
                  transform: rotate(0deg);
                }
                50% {
                  transform: rotate(-18deg);
                }
              }

              /* Bounce animation keyframes */
              @keyframes rfrMascotBounce {
                0%, 100% {
                  transform: translateY(0) scaleY(1);
                }
                50% {
                  transform: translateY(-16px) scaleY(0.96);
                }
              }

              /* Animation hook connections */
              .rfr-mascot-float[data-bobbing="true"] .m-bob {
                animation: rfrMascotFloat 3s ease-in-out infinite;
              }
              .rfr-mascot-float[data-sprout="true"] .m-sprout {
                animation: rfrMascotSway 3s ease-in-out infinite;
                transform-origin: 158px 92px;
              }
              .rfr-mascot-float[data-waving="true"] .m-wave {
                animation: rfrMascotWave 1.2s ease-in-out infinite;
                transform-origin: 250px 120px;
              }

              .motion-safe\\:animate-bounce[data-bobbing="true"] .m-bob {
                animation: rfrMascotBounce 1.2s ease-in-out infinite;
              }
              .motion-safe\\:animate-bounce[data-sprout="true"] .m-sprout {
                animation: rfrMascotSway 1.2s ease-in-out infinite;
                transform-origin: 158px 92px;
              }

              /* Stationary wave arm if not floating */
              .mascot:not(.rfr-mascot-float)[data-waving="true"] .m-wave {
                animation: rfrMascotWave 1.2s ease-in-out infinite;
                transform-origin: 250px 120px;
              }
            `}
          </style>
        </defs>

        {/* Flat Shadow at the base */}
        <ellipse className="shadow" cx="166" cy="280" rx="116" ry="16" />

        {/* Main Bobbing Group */}
        <g className="m-bob">
          {/* Head Sprout */}
          <g className="m-sprout">
            <path className="stem" d="M158 92 C158 70 158 58 158 44" />
            <path className="leaf" d="M158 56 C140 50 126 58 128 74 C146 76 158 70 158 56 Z" />
            <path className="leaf" d="M158 50 C176 42 192 50 190 66 C172 70 158 64 158 50 Z" />
          </g>

          {/* Back Legs & Tail (Rendered behind body) */}
          <ellipse className="skin-d" cx="96" cy="222" rx="27" ry="32" />
          <ellipse className="skin-d" cx="214" cy="224" rx="27" ry="32" />
          <path className="skin-d" d="M58 176 C40 178 28 190 26 204 C44 206 60 196 66 182 Z" />

          {/* Shell Rim */}
          <path className="shell-rim" d="M36 196 C30 86 92 70 162 70 C232 70 294 86 288 196 C288 210 252 220 162 220 C72 220 36 210 36 196 Z" />

          {/* Main Shell */}
          <path className="shell" d="M44 190 C40 92 96 78 162 78 C228 78 284 92 280 190 C280 200 246 206 162 206 C78 206 44 200 44 190 Z" />

          {/* Underbelly */}
          <path className="belly" d="M50 192 C92 206 232 206 274 192 C274 202 240 210 162 210 C84 210 50 202 50 192 Z" />

          {/* Shell Scutes (Plates) */}
          <polygon className="scute" points="162,86 190,102 190,134 162,150 134,134 134,102" />
          <polygon className="scute alt" points="162,150 186,162 186,184 162,196 138,184 138,162" />
          <polygon className="scute alt" points="104,108 126,120 126,148 104,160 82,148 82,120" />
          <polygon className="scute alt" points="220,108 242,120 242,148 220,160 198,148 198,120" />
          <polygon className="scute" points="108,162 126,172 126,190 108,200 90,190 90,172" />
          <polygon className="scute" points="216,162 234,172 234,190 216,200 198,190 198,172" />

          {/* Front Legs */}
          <ellipse className="skin" cx="116" cy="232" rx="25" ry="31" />
          {mood !== 'wave' && (
            <ellipse className="skin" cx="236" cy="234" rx="25" ry="31" />
          )}
          <path className="ln" d={mood === 'wave' ? 'M104 250 H128' : 'M104 250 H128 M224 252 H248'} opacity={0.4} />

          {/* Waving Arm (Conditional or animated) */}
          {mood === 'wave' && (
            <g className="m-wave">
              <ellipse className="skin" cx="250" cy="120" rx="15" ry="22" />
              <path className="ln" d="M244 104 Q250 96 256 104" opacity={0.4} />
            </g>
          )}

          {/* Head, Neck, Blush */}
          <path className="skin" d="M262 150 C276 142 296 142 310 150 L312 176 C300 188 274 188 262 178 Z" />
          <ellipse className="skin" cx="296" cy="156" rx="40" ry="36" />
          <ellipse className="cheek" cx="280" cy="174" rx="11" ry="8" />

          {/* Facial Features (Eyes and Mouth) */}
          {isBlinking ? (
            <g className="mascot-face-blinking">
              <path className="ln" d="M275 150 C280 155 292 155 297 150" />
              <path className="ln" d="M304 152 C309 157 319 157 324 152" />
              {mood === 'think' ? (
                <path className="ln" d="M280 174 Q290 169 298 175" />
              ) : (
                <path className="ln" d="M286 172 C294 180 306 180 314 171" />
              )}
            </g>
          ) : mood === 'think' ? (
            <g className="mascot-face-think">
              <ellipse className="eye-w" cx="286" cy="150" rx="11" ry="13" />
              <ellipse className="eye-w" cx="314" cy="152" rx="10" ry="12" />
              <circle className="pupil" cx="288" cy="146" r={5.5} />
              <circle className="pupil" cx="315" cy="148" r={5} />
              <circle className="glint" cx="290" cy="143" r={1.9} />
              <circle className="glint" cx="317" cy="145" r={1.7} />
              <path className="ln" d="M280 174 Q290 169 298 175" />
            </g>
          ) : (
            <g className="mascot-face-happy">
              <ellipse className="eye-w" cx="286" cy="150" rx="11" ry="13" />
              <ellipse className="eye-w" cx="314" cy="152" rx="10" ry="12" />
              <circle className="pupil" cx="289" cy="152" r={5.5} />
              <circle className="pupil" cx="316" cy="154" r={5} />
              <circle className="glint" cx="291" cy="149" r={1.9} />
              <circle className="glint" cx="318" cy="151" r={1.7} />
              <path className="ln" d="M286 172 C294 180 306 180 314 171" />
            </g>
          )}
        </g>
      </svg>
    )
  },
)

Mascot.displayName = 'Mascot'
