import { Component, Input, computed, signal, booleanAttribute, numberAttribute } from '@angular/core';
import { createTextarea } from '@refraction-ui/textarea';

@Component({
  selector: 're-textarea',
  standalone: true,
  template: `
    <textarea
      [attr.disabled]="disabled() ? '' : null"
      [attr.readonly]="readOnly() ? '' : null"
      [attr.required]="required() ? '' : null"
      [attr.aria-invalid]="api().ariaProps['aria-invalid'] ? 'true' : null"
      [attr.aria-disabled]="api().ariaProps['aria-disabled'] ? 'true' : null"
      [attr.aria-required]="api().ariaProps['aria-required'] ? 'true' : null"
      [attr.data-disabled]="api().dataAttributes['data-disabled']"
      [attr.data-readonly]="api().dataAttributes['data-readonly']"
      [attr.data-invalid]="api().dataAttributes['data-invalid']"
      [attr.rows]="rows()"
    ></textarea>
  `
})
export class TextareaComponent {
  readonly disabled = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _disabled(value: boolean) { this.disabled.set(value); }

  readonly readOnly = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _readOnly(value: boolean) { this.readOnly.set(value); }

  readonly required = signal<boolean>(false);
  @Input({ transform: booleanAttribute }) set _required(value: boolean) { this.required.set(value); }

  readonly ariaInvalid = signal<boolean>(false);
  @Input({ alias: 'aria-invalid', transform: booleanAttribute }) set _ariaInvalid(value: boolean) { this.ariaInvalid.set(value); }

  readonly rows = signal<number | undefined>(undefined);
  @Input({ transform: numberAttribute }) set _rows(value: number) { this.rows.set(value); }

  readonly api = computed(() => createTextarea({
    disabled: this.disabled(),
    readOnly: this.readOnly(),
    required: this.required(),
    'aria-invalid': this.ariaInvalid()
  }));
}
