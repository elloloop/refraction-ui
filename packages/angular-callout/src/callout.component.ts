import { Component, Input, HostBinding } from '@angular/core'
import {
  createCallout,
  createCalloutIcon,
  createCalloutContent,
  createCalloutTitle,
  createCalloutDescription,
  calloutVariants,
  calloutTitleVariants,
  calloutDescriptionVariants,
} from '@refraction-ui/callout'
import { cn } from '@refraction-ui/shared'

@Component({
  selector: 'app-callout, [app-callout]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class CalloutComponent {
  @Input() variant: 'default' | 'destructive' | 'success' | 'warning' | 'info' = 'default'
  @Input() class = ''

  private get api() {
    return createCallout({ role: this.variant === 'destructive' ? 'alert' : 'region' })
  }

  @HostBinding('class') get hostClass() {
    return cn(calloutVariants({ variant: this.variant }), this.class)
  }

  @HostBinding('attr.role') get role() {
    return this.api.ariaProps.role
  }

  @HostBinding('attr.data-slot') get dataSlot() {
    return this.api.dataAttributes['data-slot']
  }
}

@Component({
  selector: 'app-callout-icon, [app-callout-icon]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class CalloutIconComponent {
  @Input() class = ''

  private get api() {
    return createCalloutIcon()
  }

  @HostBinding('class') get hostClass() {
    return cn('flex-shrink-0 mt-0.5', this.class)
  }

  @HostBinding('attr.data-slot') get dataSlot() {
    return this.api.dataAttributes['data-slot']
  }
}

@Component({
  selector: 'app-callout-content, [app-callout-content]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class CalloutContentComponent {
  @Input() class = ''

  private get api() {
    return createCalloutContent()
  }

  @HostBinding('class') get hostClass() {
    return cn('flex-1', this.class)
  }

  @HostBinding('attr.data-slot') get dataSlot() {
    return this.api.dataAttributes['data-slot']
  }
}

@Component({
  selector: 'app-callout-title, [app-callout-title]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class CalloutTitleComponent {
  @Input() class = ''

  private get api() {
    return createCalloutTitle()
  }

  @HostBinding('class') get hostClass() {
    return cn(calloutTitleVariants(), this.class)
  }

  @HostBinding('attr.data-slot') get dataSlot() {
    return this.api.dataAttributes['data-slot']
  }
}

@Component({
  selector: 'app-callout-description, [app-callout-description]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class CalloutDescriptionComponent {
  @Input() class = ''

  private get api() {
    return createCalloutDescription()
  }

  @HostBinding('class') get hostClass() {
    return cn(calloutDescriptionVariants(), this.class)
  }

  @HostBinding('attr.data-slot') get dataSlot() {
    return this.api.dataAttributes['data-slot']
  }
}