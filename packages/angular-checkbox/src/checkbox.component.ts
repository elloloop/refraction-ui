import { Component, Input, Output, EventEmitter, computed, signal, booleanAttribute } from '@angular/core';
import { createCheckbox, type CheckedState } from '@refraction-ui/checkbox';

@Component({
  selector: 're-checkbox',
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
export class CheckboxComponent {
  readonly checked = signal<CheckedState>(false);
  @Input('checked') set _checked(value: CheckedState) { this.checked.set(value); }

  readonly disabled = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _disabled(value: boolean) { this.disabled.set(value); }

  @Output() checkedChange = new EventEmitter<CheckedState>();

  readonly api = computed(() => createCheckbox({
    checked: this.checked(),
    disabled: this.disabled()
  }));

  toggle() {
    if (!this.api().isInteractive) return;
    const nextState = this.checked() === true ? false : true;
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
