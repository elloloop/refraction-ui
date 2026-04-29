import {
  Component,
  Directive,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostBinding,
  HostListener,
  forwardRef,
  Inject,
  Optional
} from '@angular/core';
import {
  createMobileNav,
  MobileNavAPI,
  mobileNavVariants,
  mobileNavContentVariants,
  mobileNavTriggerVariants,
  mobileNavLinkVariants
} from '@refraction-ui/mobile-nav';

@Component({
  selector: 'refraction-mobile-nav',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionMobileNavComponent implements OnInit, OnChanges {
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() id?: string;
  @Input() class?: string;

  @Output() openChange = new EventEmitter<boolean>();

  public api!: MobileNavAPI;

  @HostBinding('class')
  get hostClass() {
    return mobileNavVariants() + (this.class ? ` ${this.class}` : '');
  }

  ngOnInit() {
    this.api = createMobileNav({
      open: this.open ?? this.defaultOpen,
      id: this.id,
      onOpenChange: (open: boolean) => {
        this.openChange.emit(open);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.api) {
      if (changes['open'] && !changes['open'].firstChange) {
        if (this.open !== undefined) {
          if (this.open) {
            this.api.open();
          } else {
            this.api.close();
          }
        }
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (this.api) {
      const handler = this.api.keyboardHandlers[event.key];
      if (handler) {
        handler(event as any);
      }
    }
  }
}

@Component({
  selector: 'button[refractionMobileNavTrigger]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionMobileNavTriggerComponent {
  @Input() class?: string;

  constructor(
    @Optional() @Inject(forwardRef(() => RefractionMobileNavComponent)) public nav: RefractionMobileNavComponent
  ) {}

  @HostBinding('class')
  get hostClass() {
    return mobileNavTriggerVariants() + (this.class ? ` ${this.class}` : '');
  }

  @HostBinding('attr.aria-expanded')
  get ariaExpanded() {
    return this.nav?.api?.triggerProps['aria-expanded'];
  }

  @HostBinding('attr.aria-controls')
  get ariaControls() {
    return this.nav?.api?.triggerProps['aria-controls'];
  }

  @HostBinding('attr.aria-label')
  get ariaLabel() {
    return this.nav?.api?.triggerProps['aria-label'] || 'Toggle menu';
  }

  @HostListener('click')
  onClick() {
    if (this.nav?.api) {
      this.nav.api.toggle();
    }
  }
}

@Directive({
  selector: '[refractionMobileNavContent]',
  standalone: true,
})
export class RefractionMobileNavContentDirective {
  @Input() class?: string;

  constructor(
    @Optional() @Inject(forwardRef(() => RefractionMobileNavComponent)) public nav: RefractionMobileNavComponent
  ) {}

  @HostBinding('class')
  get hostClass() {
    const state = this.nav?.api?.state.open ? 'open' : 'closed';
    return mobileNavContentVariants({ state }) + (this.class ? ` ${this.class}` : '');
  }

  @HostBinding('attr.id')
  get id() {
    return this.nav?.api?.contentProps['id'];
  }

  @HostBinding('attr.role')
  get role() {
    return this.nav?.api?.contentProps['role'];
  }

  @HostBinding('attr.data-state')
  get dataState() {
    return this.nav?.api?.contentProps['data-state'];
  }
}

@Directive({
  selector: 'a[refractionMobileNavLink]',
  standalone: true,
})
export class RefractionMobileNavLinkDirective {
  @Input() class?: string;

  @HostBinding('class')
  get hostClass() {
    return mobileNavLinkVariants() + (this.class ? ` ${this.class}` : '');
  }

  @HostBinding('attr.role')
  get role() {
    return 'menuitem';
  }
}
