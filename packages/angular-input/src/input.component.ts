import { Component, Input, computed, signal, booleanAttribute } from '@angular/core';
import { createInput, type InputType } from '@refraction-ui/input';

@Component({
  selector: 're-input',
  standalone: true,
  template: `
    <input
      [type]="type() || 'text'"
      [attr.disabled]="disabled() ? '' : null"
      [attr.readonly]="readOnly() ? '' : null"
      [attr.required]="required() ? '' : null"
      [attr.placeholder]="placeholder()"
      [attr.aria-invalid]="api().ariaProps['aria-invalid'] ? 'true' : null"
      [attr.aria-disabled]="api().ariaProps['aria-disabled'] ? 'true' : null"
      [attr.aria-required]="api().ariaProps['aria-required'] ? 'true' : null"
      [attr.data-disabled]="api().dataAttributes['data-disabled']"
      [attr.data-readonly]="api().dataAttributes['data-readonly']"
      [attr.data-invalid]="api().dataAttributes['data-invalid']"
    />
  `
})
export class InputComponent {
  readonly type = signal<InputType | undefined>(undefined);
  @Input('type') set _type(value: InputType | undefined) { this.type.set(value); }

  readonly disabled = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _disabled(value: boolean) { this.disabled.set(value); }

  readonly readOnly = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _readOnly(value: boolean) { this.readOnly.set(value); }

  readonly required = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _required(value: boolean) { this.required.set(value); }

  readonly placeholder = signal<string | undefined>(undefined);
  @Input('placeholder') set _placeholder(value: string | undefined) { this.placeholder.set(value); }

  readonly ariaInvalid = signal<boolean>(false);
  @Input({ alias: 'aria-invalid', transform: booleanAttribute }) set _ariaInvalid(value: boolean) { this.ariaInvalid.set(value); }

  readonly api = computed(() => createInput({
    type: this.type(),
    disabled: this.disabled(),
    readOnly: this.readOnly(),
    required: this.required(),
    placeholder: this.placeholder(),
    'aria-invalid': this.ariaInvalid()
  }));
}
