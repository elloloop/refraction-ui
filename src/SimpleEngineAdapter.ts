import { EngineAdapter } from './EngineAdapter';

type Component = (...args: any[]) => any;

type Theme = Record<string, unknown>;

export class SimpleEngineAdapter implements EngineAdapter {
  private components = new Map<string, Component>();
  private theme: Theme | null = null;

  registerComponent(name: string, component: Component): void {
    this.components.set(name, component);
  }

  getComponent(name: string): Component | null {
    return this.components.get(name) || null;
  }

  applyTheme(theme: Theme): void {
    this.theme = theme;
  }

  getTheme(): Theme | null {
    return this.theme;
  }

  enhanceAccessibility(component: Component): Component {
    return component;
  }

  handleEvent(_event: Event): void {
    // no-op for now
  }

  compose(component: Component, _props?: Record<string, unknown>): Component {
    return component;
  }
}
