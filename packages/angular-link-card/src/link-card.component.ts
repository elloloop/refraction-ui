import { Component, Input, HostBinding } from '@angular/core';
import { createLinkCard } from '@refraction-ui/link-card';

@Component({
  selector: 'refraction-link-card, [refractionLinkCard]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionLinkCardComponent {
  @Input() href?: string;

  @HostBinding('attr.data-slot')
  get dataSlot() {
    return createLinkCard({ href: this.href }).dataAttributes['data-slot'];
  }
}