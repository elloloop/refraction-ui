import { Injectable, signal, computed } from '@angular/core';
import { createAppShell, type AppShellConfig, type AppShellState, type AppShellAPI, type BreakpointName } from '@refraction-ui/app-shell';

@Injectable()
export class AppShellService {
  private api!: AppShellAPI;
  
  // State signal
  private _state = signal<AppShellState | null>(null);
  
  // Public selectors
  readonly state = computed(() => this._state());
  readonly isMobile = computed(() => this._state()?.isMobile ?? false);
  readonly isTablet = computed(() => this._state()?.isTablet ?? false);
  readonly isDesktop = computed(() => this._state()?.isDesktop ?? false);
  readonly sidebarOpen = computed(() => this._state()?.sidebarOpen ?? false);
  readonly sidebarCollapsed = computed(() => this._state()?.sidebarCollapsed ?? false);

  init(config?: AppShellConfig) {
    this.api = createAppShell(config);
    this._state.set(this.api.state);
    
    // Subscribe to updates from the headless core
    this.api.subscribe((newState) => {
      this._state.set(newState);
    });
  }

  get apiInstance() {
    return this.api;
  }

  toggleSidebar() {
    this.api.toggleSidebar();
  }

  openSidebar() {
    this.api.openSidebar();
  }

  closeSidebar() {
    this.api.closeSidebar();
  }

  collapseSidebar() {
    this.api.collapseSidebar();
  }

  expandSidebar() {
    this.api.expandSidebar();
  }

  setBreakpoint(bp: BreakpointName) {
    this.api.setBreakpoint(bp);
  }

  getCSSVariables() {
    return this.api.getCSSVariables();
  }
}
