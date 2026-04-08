export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
} from './tabs.js'

// Re-export headless types for convenience
export {
  type TabsProps as CoreTabsProps,
  type TabsAPI,
  type TabsState,
  tabsListVariants,
  tabsTriggerVariants,
} from '@refraction-ui/tabs'
