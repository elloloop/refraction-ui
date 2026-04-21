import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import {
  createDatePicker,
  type CalendarDay,
} from '@refraction-ui/date-picker';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

@Component({
  selector: 're-date-picker',
  standalone: true,
  template: `
    <div class="re-date-picker" style="position: relative; display: inline-block;">
      <!-- Trigger button -->
      <button
        type="button"
        [attr.id]="api().ids.trigger"
        [attr.role]="api().triggerProps['role']"
        [attr.aria-expanded]="api().triggerProps['aria-expanded']"
        [attr.aria-controls]="api().triggerProps['aria-controls']"
        [attr.aria-haspopup]="api().triggerProps['aria-haspopup']"
        [disabled]="disabled()"
        (click)="toggle()"
        (keydown)="onTriggerKeyDown($event)"
      >
        {{ api().formatDisplay() }}
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
      <div
        [attr.id]="api().ids.dropdown"
        [attr.role]="api().dropdownProps['role']"
        [attr.aria-modal]="api().dropdownProps['aria-modal']"
        [attr.aria-labelledby]="api().dropdownProps['aria-labelledby']"
        style="position: absolute; z-index: 50; margin-top: 4px;"
      >
        <!-- Month navigation -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <button type="button" (click)="prevMonth()" aria-label="Previous month">&lsaquo;</button>
          <span [attr.id]="api().ids.label" style="font-size: 14px; font-weight: 500;">{{ monthLabel() }}</span>
          <button type="button" (click)="nextMonth()" aria-label="Next month">&rsaquo;</button>
        </div>

        <!-- Calendar grid -->
        <div
          [attr.id]="api().ids.grid"
          [attr.role]="api().gridProps['role']"
          [attr.aria-labelledby]="api().gridProps['aria-labelledby']"
          style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; text-align: center;"
        >
          @for (header of dayHeaders; track header) {
          <div style="font-size: 12px; padding: 4px 0; font-weight: 500;">
            {{ header }}
          </div>
          }
          @for (day of days(); track day.date.toISOString()) {
          <button
            type="button"
            [attr.role]="getDayAriaProps(day)['role']"
            [attr.aria-selected]="getDayAriaProps(day)['aria-selected']"
            [attr.aria-disabled]="getDayAriaProps(day)['aria-disabled']"
            [attr.aria-current]="getDayAriaProps(day)['aria-current']"
            [attr.aria-label]="getDayAriaProps(day)['aria-label']"
            [disabled]="day.isDisabled"
            [attr.data-selected]="day.isSelected || null"
            [attr.data-today]="day.isToday || null"
            [attr.data-outside]="!day.isCurrentMonth || null"
            [attr.data-disabled]="day.isDisabled || null"
            (click)="selectDate(day.date)"
          >
            {{ day.date.getDate() }}
          </button>
          }
        </div>

        <!-- Time inputs -->
        @if (showTime()) {
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid;">
          <span style="font-size: 14px;">Time:</span>
          <input
            type="number"
            [value]="hours()"
            min="0"
            max="23"
            aria-label="Hours"
            style="width: 56px; text-align: center;"
            (change)="onHoursChange($event)"
          />
          <span>:</span>
          <input
            type="number"
            [value]="minutes()"
            min="0"
            max="59"
            aria-label="Minutes"
            style="width: 56px; text-align: center;"
            (change)="onMinutesChange($event)"
          />
        </div>
        }
      </div>
      }
    </div>
  `,
})
export class DatePickerComponent {
  private elementRef = inject(ElementRef);

  readonly dayHeaders = DAY_HEADERS;

  // Inputs
  readonly value = signal<Date | undefined>(undefined);
  @Input('value') set _value(val: Date | string | undefined) {
    this.value.set(val ? new Date(val) : undefined);
  }

  readonly minDate = signal<Date | undefined>(undefined);
  @Input('minDate') set _minDate(val: Date | string | undefined) {
    this.minDate.set(val ? new Date(val) : undefined);
  }

  readonly maxDate = signal<Date | undefined>(undefined);
  @Input('maxDate') set _maxDate(val: Date | string | undefined) {
    this.maxDate.set(val ? new Date(val) : undefined);
  }

  readonly showTime = signal<boolean>(false);
  @Input('showTime') set _showTime(val: boolean | string) {
    this.showTime.set(val === '' || val === true || val === 'true');
  }

  readonly format = signal<string | undefined>(undefined);
  @Input('format') set _format(val: string | undefined) {
    this.format.set(val);
  }

  readonly placeholder = signal<string>('Select date...');
  @Input('placeholder') set _placeholder(val: string) {
    this.placeholder.set(val);
  }

  readonly disabled = signal<boolean>(false);
  @Input('disabled') set _disabled(val: boolean | string) {
    this.disabled.set(val === '' || val === true || val === 'true');
  }

  // Outputs
  @Output() valueChange = new EventEmitter<Date>();
  @Output() openChange = new EventEmitter<boolean>();

  // Internal state
  readonly open = signal<boolean>(false);
  readonly currentMonth = signal<Date>(new Date());

  readonly api = computed(() => {
    const val = this.value();
    return createDatePicker({
      value: val,
      minDate: this.minDate(),
      maxDate: this.maxDate(),
      showTime: this.showTime(),
      format: this.format(),
      placeholder: this.placeholder(),
      open: this.open(),
      defaultMonth: this.currentMonth(),
    });
  });

  readonly days = computed(() => this.api().days);
  readonly hours = computed(() => this.api().state.hours);
  readonly minutes = computed(() => this.api().state.minutes);

  readonly monthLabel = computed(() => {
    const month = this.api().state.currentMonth;
    return month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  isOpen(): boolean {
    return this.open();
  }

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.open();
    this.open.set(next);
    this.openChange.emit(next);
  }

  prevMonth(): void {
    const current = this.api().state.currentMonth;
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    // Recreate api by updating value signal to trigger recomputation
    this.rebuildApi();
  }

  nextMonth(): void {
    const current = this.api().state.currentMonth;
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    this.rebuildApi();
  }

  selectDate(date: Date): void {
    const newDate = new Date(date);
    const currentValue = this.value();
    if (currentValue) {
      newDate.setHours(currentValue.getHours());
      newDate.setMinutes(currentValue.getMinutes());
    }
    this.value.set(newDate);
    this.valueChange.emit(newDate);
    if (!this.showTime()) {
      this.open.set(false);
      this.openChange.emit(false);
    }
  }

  onHoursChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const h = parseInt(input.value, 10);
    if (isNaN(h) || h < 0 || h > 23) return;
    const newDate = this.value() ? new Date(this.value()!) : new Date();
    newDate.setHours(h);
    this.value.set(newDate);
    this.valueChange.emit(newDate);
  }

  onMinutesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const m = parseInt(input.value, 10);
    if (isNaN(m) || m < 0 || m > 59) return;
    const newDate = this.value() ? new Date(this.value()!) : new Date();
    newDate.setMinutes(m);
    this.value.set(newDate);
    this.valueChange.emit(newDate);
  }

  getDayAriaProps(day: CalendarDay) {
    return this.api().getDayAriaProps(day);
  }

  onTriggerKeyDown(event: KeyboardEvent): void {
    const handler = this.api().keyboardHandlers[event.key];
    if (handler) {
      handler(event);
      this.open.set(false);
      this.openChange.emit(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.open()) {
        this.open.set(false);
        this.openChange.emit(false);
      }
    }
  }

  private rebuildApi(): void {
    // Force signal update to trigger recomputation
    const current = this.value();
    this.value.set(current);
  }
}
