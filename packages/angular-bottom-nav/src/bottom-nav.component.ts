import { Component, Input } from '@angular/core';
import {
  createBottomNav,
  bottomNavVariants,
  bottomNavTabVariants,
  type NavTab,
} from '@refraction-ui/bottom-nav';

@Component({
  selector: 're-bottom-nav',
  standalone: true,
  template: `
    <nav
      role="navigation"
      [attr.aria-label]="api.ariaProps['aria-label']"
      [class]="navClass"
    >
      <div style="display: flex;">
        @for (tab of tabsList; track tab.href) {
          <a
            [attr.href]="tab.href"
            [class]="getTabClass(tab.href)"
            [attr.aria-current]="getAriaCurrent(tab.href)"
          >
            @if (tab.icon) {
              <span aria-hidden="true">{{ getIcon(tab) }}</span>
            }
            <span>{{ tab.label }}</span>
          </a>
        }
      </div>
    </nav>
  `,
})
export class BottomNavComponent {
  @Input() tabs?: NavTab[];
  @Input() currentPath?: string;
  @Input() customClass?: string;

  get api() {
    return createBottomNav({ currentPath: this.currentPath });
  }

  get tabsList(): NavTab[] {
    return this.tabs || [];
  }

  get navClass(): string {
    return bottomNavVariants() + (this.customClass ? ' ' + this.customClass : '');
  }

  getTabClass(href: string): string {
    let active: 'true' | 'false' = 'false';
    if (this.api.isActive(href)) active = 'true';
    return bottomNavTabVariants({ active });
  }

  getAriaCurrent(href: string): string | null {
    return this.api.tabAriaProps(href)['aria-current'] || null;
  }

  getIcon(tab: NavTab): string {
    if (this.api.isActive(tab.href) && tab.activeIcon) {
      return tab.activeIcon;
    }
    return tab.icon || '';
  }
}
