import { Component, Input, HostBinding, OnChanges, SimpleChanges } from '@angular/core';
import { createBadge, BadgeVariant, BadgeSize, BadgeAPI } from '@refraction-ui/badge';

@Component({
  selector: '[refractionBadge]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionBadgeComponent implements OnChanges {
  @Input() variant?: BadgeVariant;
  @Input() size?: BadgeSize;

  private api!: BadgeAPI;

  constructor() {
    this.updateApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateApi();
  }

  private updateApi() {
    this.api = createBadge({
      variant: this.variant,
      size: this.size,
    });
  }

  @HostBinding('attr.role')
  get role() {
    return this.api.ariaProps.role || null;
  }

  @HostBinding('attr.data-variant')
  get dataVariant() {
    return this.api.dataAttributes['data-variant'] || null;
  }
}
