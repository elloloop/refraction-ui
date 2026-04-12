import { Component, Input, HostBinding, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { createButton, getButtonType, ButtonVariant, ButtonSize, ButtonAPI } from '@refraction-ui/button';

@Component({
  selector: 'button[refractionButton], a[refractionButton]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class RefractionButtonComponent implements OnChanges {
  @Input() variant?: ButtonVariant;
  @Input() size?: ButtonSize;
  @Input() disabled?: boolean;
  @Input() loading?: boolean;
  @Input() type?: 'button' | 'submit' | 'reset';

  private api!: ButtonAPI;

  constructor() {
    this.updateApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateApi();
  }

  private updateApi() {
    this.api = createButton({
      variant: this.variant,
      size: this.size,
      disabled: this.disabled,
      loading: this.loading,
      type: this.type,
    });
  }

  @HostBinding('attr.aria-disabled')
  get ariaDisabled() {
    return this.api.ariaProps['aria-disabled'] ? true : null;
  }

  @HostBinding('attr.aria-label')
  get ariaLabel() {
    return this.api.ariaProps['aria-label'] || null;
  }

  @HostBinding('attr.data-loading')
  get dataLoading() {
    return this.api.dataAttributes['data-loading'] !== undefined ? '' : null;
  }

  @HostBinding('attr.data-disabled')
  get dataDisabled() {
    return this.api.dataAttributes['data-disabled'] !== undefined ? '' : null;
  }

  @HostBinding('attr.type')
  get buttonType() {
    return getButtonType({ type: this.type });
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const handler = this.api.keyboardHandlers[event.key];
    if (handler) {
      handler(event as any);
    }
  }
}
