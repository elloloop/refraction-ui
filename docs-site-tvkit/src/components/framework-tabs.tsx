'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@refraction-ui/react-tabs'
import { CodeSample } from './code-sample'

interface FrameworkTabsProps {
  vanilla: string
  react: string
  title?: string
}

/**
 * Client-only wrapper around the refraction-ui Tabs for rendering paired
 * vanilla / React code samples. Lives in its own file so the server pages
 * that include it don't have to opt into `'use client'` themselves.
 */
export function FrameworkTabs({ vanilla, react, title }: FrameworkTabsProps) {
  return (
    <Tabs defaultValue="vanilla">
      <TabsList>
        <TabsTrigger value="vanilla">Vanilla</TabsTrigger>
        <TabsTrigger value="react">React</TabsTrigger>
      </TabsList>
      <TabsContent value="vanilla">
        <CodeSample title={title ?? 'vanilla template'}>{vanilla}</CodeSample>
      </TabsContent>
      <TabsContent value="react">
        <CodeSample title={title ?? 'react template'}>{react}</CodeSample>
      </TabsContent>
    </Tabs>
  )
}
