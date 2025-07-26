export interface EngineAdapter {
  // Component management
  registerComponent(name: string, component: unknown): void;
  getComponent(name: string): unknown | null;

  // Theme integration
  applyTheme(theme: unknown): void;
  getTheme(): unknown;

  // Accessibility
  enhanceAccessibility(component: unknown): unknown;

  // Event handling
  handleEvent(event: Event): void;

  // Composition support
  compose(component: unknown, props?: Record<string, unknown>): unknown;
}
