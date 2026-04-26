import { Component, Input, HostBinding, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellService } from './app-shell.service';

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
@Component({
  selector: 're-app-shell-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: hsl(var(--background));
      transition: width 200ms ease-in-out, transform 200ms ease-in-out;
      height: 100%;
    }
  `]
})
export class AppShellSidebarComponent {
  constructor(private shell: AppShellService) {}

  @HostBinding('class')
  get hostClasses() {
    const api = this.shell.apiInstance;
    const state = this.shell.state();
    if (!state || !api) return '';

    const isRight = api.config.sidebarPosition === 'right';
    const borderClass = isRight ? 'border-l' : 'border-r';
    
    const classes = [borderClass];

    if (state.isMobile) {
      classes.push('fixed top-0 z-40');
      classes.push(isRight ? 'right-0' : 'left-0');
      
      const isOpen = state.sidebarOpen;
      const translateClass = isOpen 
        ? 'translate-x-0' 
        : (isRight ? 'translate-x-full' : '-translate-x-full');
      classes.push(translateClass);
    } else {
      classes.push('relative');
    }

    return classes.join(' ');
  }

  @HostBinding('style.width')
  get width() {
    const state = this.shell.state();
    if (!state) return 'auto';
    return state.isMobile ? 'var(--shell-sidebar-full-width)' : 'var(--shell-sidebar-width)';
  }

  @HostBinding('attr.role') role = 'navigation';
  @HostBinding('attr.aria-label') label = 'Sidebar';
  
  @HostBinding('attr.data-collapsed')
  get dataCollapsed() {
    return this.shell.sidebarCollapsed() ? '' : null;
  }

  @HostBinding('attr.data-open')
  get dataOpen() {
    return this.shell.sidebarOpen() ? '' : null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
@Component({
  selector: 're-app-shell-main',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: flex;
      flex: 1 1 0%;
      flex-direction: column;
      min-width: 0;
      height: 100%;
    }
  `]
})
export class AppShellMainComponent {}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
@Component({
  selector: 're-app-shell-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      *ngIf="shell.isMobile()"
      type="button"
      aria-label="Toggle sidebar"
      [attr.aria-expanded]="shell.sidebarOpen()"
      (click)="shell.toggleSidebar()"
      class="inline-flex items-center justify-center p-2 mr-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
    <ng-content></ng-content>
  `,
  styles: [`
    :host {
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      height: var(--shell-header-height);
      border-bottom-width: 1px;
      background-color: hsl(var(--background));
      padding-left: 1rem;
      padding-right: 1rem;
    }
  `]
})
export class AppShellHeaderComponent {
  constructor(public shell: AppShellService) {}
  
  @HostBinding('attr.role') role = 'banner';
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
@Component({
  selector: 're-app-shell-content',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: block;
      flex: 1 1 0%;
      overflow-y: auto;
      padding: 1.5rem 1rem;
    }
    @media (min-width: 640px) { :host { padding-left: 1.5rem; padding-right: 1.5rem; } }
    @media (min-width: 1024px) { :host { padding-left: 2rem; padding-right: 2rem; } }
  `]
})
export class AppShellContentComponent {
  @Input() maxWidth?: string;

  @HostBinding('class')
  get hostClasses() {
    if (!this.maxWidth) return '';
    return `max-w-${this.maxWidth} mx-auto w-full`;
  }
  
  @HostBinding('attr.role') role = 'main';
}

// ---------------------------------------------------------------------------
// MobileNav
// ---------------------------------------------------------------------------
@Component({
  selector: 're-app-shell-mobile-nav',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-around;
      border-top-width: 1px;
      background-color: hsl(var(--background));
      height: 3.5rem;
    }
  `]
})
export class AppShellMobileNavComponent {
  constructor(private shell: AppShellService) {}

  @HostBinding('style.display')
  get display() {
    const state = this.shell.state();
    const api = this.shell.apiInstance;
    if (!state || !api) return 'none';
    const config = api.config;
    return (state.isMobile && config.mobileNavPosition !== 'none') ? 'flex' : 'none';
  }
  
  @HostBinding('attr.role') role = 'navigation';
  @HostBinding('attr.aria-label') label = 'Mobile navigation';
}

// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------
@Component({
  selector: 're-app-shell-overlay',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      z-index: 30;
      background-color: rgba(0, 0, 0, 0.5);
      transition-property: opacity;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
  `]
})
export class AppShellOverlayComponent {
  constructor(private shell: AppShellService) {}

  @HostBinding('style.display')
  get display() {
    const state = this.shell.state();
    return (state?.isMobile && state?.sidebarOpen) ? 'block' : 'none';
  }

  @HostListener('click')
  onClick() {
    this.shell.closeSidebar();
  }
  
  @HostBinding('attr.aria-hidden') hidden = 'true';
  @HostBinding('attr.data-shell-overlay') dataAttr = '';
}
