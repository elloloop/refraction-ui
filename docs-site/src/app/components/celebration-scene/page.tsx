import { CelebrationSceneExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { InstallCommand } from '@/components/install-command'
import { CodeBlock } from '@/components/code-block'

const usage = `import { CelebrationScene } from '@refraction-ui/react'

<section>
  <CelebrationScene scene="heart-bloom" />
  <h2>Thank you for the careful review.</h2>
  <p>You caught the mismatch before it shipped.</p>
</section>`

export default function CelebrationScenePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Celebration Scene</h1>
      <p>
        A decorative, finite scene for thank-yous and celebrations. It plays once
        for 2.4 seconds and respects reduced motion. Put the real message in
        adjacent accessible text; never communicate status through animation alone.
      </p>
      <CelebrationSceneExamples />
      <CodeBlock code={usage} />
      <PropsTable props={[
        { name: 'scene', type: 'CelebrationSceneStyle', default: 'confetti',
          description: 'One of 20 stable scene styles.' },
        { name: 'animate', type: 'boolean', default: 'true',
          description: 'Play once on mount. False shows the settled illustration; reduced motion always wins.' },
      ]} />
      <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
    </div>
  )
}
