import { Component, Input, Output, EventEmitter, computed, signal, booleanAttribute } from '@angular/core';
import { createSwitch } from '@refraction-ui/switch';

@Component({
  selector: 're-switch',
  standalone: true,
  template: `
    <button
      type="button"
      [attr.role]="api().ariaProps.role"
      [attr.aria-checked]="api().ariaProps['aria-checked']"
      [attr.aria-disabled]="api().ariaProps['aria-disabled'] ? 'true' : null"
      [attr.data-state]="api().dataAttributes['data-state']"
      [attr.data-disabled]="api().dataAttributes['data-disabled']"
      [disabled]="api().state.disabled ? true : null"
      (click)="toggle()"
      (keydown)="onKeyDown($event)"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class SwitchComponent {
  readonly checked = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _checked(value: boolean) { this.checked.set(value); }

  readonly disabled = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _disabled(value: boolean) { this.disabled.set(value); }

  @Output() checkedChange = new EventEmitter<boolean>();

  readonly api = computed(() => createSwitch({
    checked: this.checked(),
    disabled: this.disabled()
  }));

  toggle() {
    if (!this.api().isInteractive) return;
    const nextState = !this.checked();
    this.checked.set(nextState);
    this.checkedChange.emit(nextState);
  }

  onKeyDown(event: KeyboardEvent) {
    const handler = this.api().keyboardHandlers[event.key];
    if (handler) {
      handler(event as any);
    }
  }
}
