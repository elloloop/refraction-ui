import { ThemePlayground } from './playground'

export default function ThemePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Theme Playground</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Customize the Refraction UI theme by editing CSS variables in real time.
          Preview components with your changes, then export the CSS.
        </p>
      </div>

      <ThemePlayground />
    </div>
  )
}
