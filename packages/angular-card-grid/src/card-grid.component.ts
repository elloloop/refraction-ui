import { Component, Input, HostBinding } from '@angular/core';
import { createCardGrid } from '@refraction-ui/card-grid';

@Component({
  selector: 'refraction-card-grid, [refractionCardGrid]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionCardGridComponent {
  @Input() columns?: number;

  @HostBinding('attr.data-slot')
  get dataSlot() {
    return createCardGrid({ columns: this.columns }).dataAttributes['data-slot'];
  }
}