'use client'

/**
 * Re-exports of refraction-ui components packaged inside a `'use client'`
 * boundary. Most refraction-ui components pull in React `createContext` /
 * `useContext` transitively (e.g. Button uses the keyboard-shortcut
 * context), and the published dist files do not carry the
 * `'use client'` directive themselves. Re-exporting them from this file
 * makes any page importing from here treat them as client components,
 * which is the sole way to render them with Next.js's RSC pipeline.
 */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@refraction-ui/react-card'
export { Button } from '@refraction-ui/react-button'
export { Badge } from '@refraction-ui/react-badge'
export { Tabs, TabsList, TabsTrigger, TabsContent } from '@refraction-ui/react-tabs'
