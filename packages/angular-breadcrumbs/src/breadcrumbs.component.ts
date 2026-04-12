import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createBreadcrumbs, type BreadcrumbItem, type BreadcrumbsAPI } from '@refraction-ui/breadcrumbs';

@Component({
  selector: 'refraction-breadcrumbs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav [attr.aria-label]="api.ariaProps['aria-label']">
      <ol class="flex items-center space-x-2">
        <li *ngFor="let item of api.items; let i = index" class="flex items-center">
          <ng-container *ngIf="item.href; else textOnly">
            <a [href]="item.href" [attr.aria-current]="api.itemAriaProps(i)['aria-current']">
              {{ item.label }}
            </a>
          </ng-container>
          <ng-template #textOnly>
            <span [attr.aria-current]="api.itemAriaProps(i)['aria-current']">
              {{ item.label }}
            </span>
          </ng-template>
          <span *ngIf="!api.isLast(i)" class="mx-2" aria-hidden="true">{{ api.separator }}</span>
        </li>
      </ol>
    </nav>
  `
})
export class BreadcrumbsComponent {
  @Input() pathname?: string;
  @Input() items?: BreadcrumbItem[];
  @Input() labels?: Record<string, string>;
  @Input() separator: string = '/';
  @Input() maxItems?: number;

  get api(): BreadcrumbsAPI {
    return createBreadcrumbs({
      pathname: this.pathname,
      items: this.items,
      labels: this.labels,
      separator: this.separator,
      maxItems: this.maxItems
    });
  }
}
