import { Component, Input, HostBinding, OnChanges, SimpleChanges } from '@angular/core';
import { 
  createCard, 
  createCardHeader, 
  createCardTitle, 
  createCardDescription, 
  createCardContent, 
  createCardFooter,
  CardAPI 
} from '@refraction-ui/card';

@Component({
  selector: 'refraction-card, [refractionCard]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionCardComponent implements OnChanges {
  @Input() role?: string;

  private api!: CardAPI;

  constructor() {
    this.updateApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateApi();
  }

  private updateApi() {
    this.api = createCard({
      role: this.role,
    });
  }

  @HostBinding('attr.role')
  get attrRole() {
    return this.api.ariaProps.role || null;
  }

  @HostBinding('attr.data-slot')
  get dataSlot() {
    return this.api.dataAttributes['data-slot'] || null;
  }
}

@Component({
  selector: 'refraction-card-header, [refractionCardHeader]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionCardHeaderComponent {
  @HostBinding('attr.data-slot')
  get dataSlot() {
    return createCardHeader().dataAttributes['data-slot'];
  }
}

@Component({
  selector: 'refraction-card-title, [refractionCardTitle]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionCardTitleComponent {
  @HostBinding('attr.data-slot')
  get dataSlot() {
    return createCardTitle().dataAttributes['data-slot'];
  }
}

@Component({
  selector: 'refraction-card-description, [refractionCardDescription]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionCardDescriptionComponent {
  @HostBinding('attr.data-slot')
  get dataSlot() {
    return createCardDescription().dataAttributes['data-slot'];
  }
}

@Component({
  selector: 'refraction-card-content, [refractionCardContent]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionCardContentComponent {
  @HostBinding('attr.data-slot')
  get dataSlot() {
    return createCardContent().dataAttributes['data-slot'];
  }
}

@Component({
  selector: 'refraction-card-footer, [refractionCardFooter]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionCardFooterComponent {
  @HostBinding('attr.data-slot')
  get dataSlot() {
    return createCardFooter().dataAttributes['data-slot'];
  }
}
