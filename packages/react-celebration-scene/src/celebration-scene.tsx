import {forwardRef, type HTMLAttributes} from 'react'
import {cn} from '@refraction-ui/shared'
import {celebrationSceneCSS, celebrationSceneSVG, type CelebrationSceneStyle} from '@refraction-ui/celebration-scene'

export interface CelebrationSceneProps extends HTMLAttributes<HTMLDivElement> {
  scene?: CelebrationSceneStyle
  /** Plays once on mount; reduced motion always displays the settled scene. */
  animate?: boolean
}
/** Decorative only: keep the meaningful thank-you or achievement in adjacent text. */
export const CelebrationScene = forwardRef<HTMLDivElement,CelebrationSceneProps>(
  function CelebrationScene({scene='confetti',animate=true,className,...rest},ref){
    return <div {...rest} ref={ref} className={cn('rui-celebration-scene',className)} data-animate={animate} aria-hidden="true">
      <style>{celebrationSceneCSS}</style>
      <div className="rui-celebration-stage" key={scene} dangerouslySetInnerHTML={{__html:celebrationSceneSVG(scene)}} />
    </div>
  }
)
