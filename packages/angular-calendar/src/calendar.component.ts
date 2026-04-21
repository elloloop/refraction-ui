import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import {
  createCalendar,
  type CalendarDay,
  calendarVariants,
  dayVariants,
} from '@refraction-ui/calendar';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

@Component({
  selector: 're-calendar',
  standalone: true,
  template: `
    <div
      [class]="calendarClasses()"
      [attr.id]="api().ids.grid"
      [attr.role]="api().ariaProps['role']"
      [attr.aria-labelledby]="api().ariaProps['aria-labelledby']"
    >
      <!-- Header row: prev, month label, next -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <button
          type="button"
          aria-label="Previous month"
          (click)="prevMonth()"
          style="display: inline-flex; align-items: center; justify-content: center; height: 28px; width: 28px; border-radius: 6px; cursor: pointer;"
        >
          &lsaquo;
        </button>
        <div
          [attr.id]="api().ids.label"
          style="font-size: 14px; font-weight: 500;"
          aria-live="polite"
        >
          {{ monthLabel() }}
        </div>
        <button
          type="button"
          aria-label="Next month"
          (click)="nextMonth()"
          style="display: inline-flex; align-items: center; justify-content: center; height: 28px; width: 28px; border-radius: 6px; cursor: pointer;"
        >
          &rsaquo;
        </button>
      </div>

      <!-- Day-of-week headers -->
      <div
        style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 4px;"
        role="row"
      >
        @for (header of dayHeaders; track header) {
        <div
          style="text-align: center; font-size: 12px; font-weight: 500; height: 36px; display: flex; align-items: center; justify-content: center;"
          role="columnheader"
          [attr.aria-label]="header"
        >
          {{ header }}
        </div>
        }
      </div>

      <!-- Day grid -->
      <div
        style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;"
        role="rowgroup"
      >
        @for (day of days(); track day.date.toISOString()) {
        <button
          type="button"
          [class]="getDayClass(day)"
          [disabled]="day.isDisabled"
          [attr.role]="getDayAriaProps(day)['role']"
          [attr.aria-selected]="getDayAriaProps(day)['aria-selected']"
          [attr.aria-disabled]="getDayAriaProps(day)['aria-disabled']"
          [attr.aria-current]="getDayAriaProps(day)['aria-current']"
          [attr.aria-label]="getDayAriaProps(day)['aria-label']"
          (click)="selectDate(day.date)"
        >
          {{ day.date.getDate() }}
        </button>
        }
      </div>
    </div>
  `,
})
export class CalendarComponent {
  readonly dayHeaders = DAY_HEADERS;
  private readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Inputs
  readonly value = signal<Date | undefined>(undefined);
  @Input('value') set _value(val: Date | string | undefined) {
    this.value.set(val ? new Date(val) : undefined);
  }

  readonly defaultValue = signal<Date | undefined>(undefined);
  @Input('defaultValue') set _defaultValue(val: Date | string | undefined) {
    this.defaultValue.set(val ? new Date(val) : undefined);
  }

  readonly minDate = signal<Date | undefined>(undefined);
  @Input('minDate') set _minDate(val: Date | string | undefined) {
    this.minDate.set(val ? new Date(val) : undefined);
  }

  readonly maxDate = signal<Date | undefined>(undefined);
  @Input('maxDate') set _maxDate(val: Date | string | undefined) {
    this.maxDate.set(val ? new Date(val) : undefined);
  }

  readonly disabledDates = signal<Date[]>([]);
  @Input('disabledDates') set _disabledDates(val: (Date | string)[]) {
    this.disabledDates.set(val ? val.map((d) => new Date(d)) : []);
  }

  readonly customClass = signal<string>('');
  @Input('class') set _customClass(val: string) {
    this.customClass.set(val || '');
  }

  // Month input/state
  readonly inputMonth = signal<Date | undefined>(undefined);
  @Input('month') set _month(val: Date | string | undefined) {
    this.inputMonth.set(val ? new Date(val) : undefined);
  }

  readonly internalMonth = signal<Date | undefined>(undefined);

  readonly currentDisplayMonth = computed(() => {
    return this.inputMonth() ?? this.internalMonth() ?? this.value() ?? this.defaultValue() ?? new Date();
  });

  // Outputs
  @Output() valueChange = new EventEmitter<Date>();
  @Output() monthChange = new EventEmitter<Date>();

  readonly api = computed(() => {
    return createCalendar({
      value: this.value(),
      defaultValue: this.defaultValue(),
      minDate: this.minDate(),
      maxDate: this.maxDate(),
      disabledDates: this.disabledDates(),
      month: this.currentDisplayMonth(),
    });
  });

  readonly days = computed(() => this.api().days);

  readonly monthLabel = computed(() => {
    const month = this.api().state.currentMonth;
    return `${this.monthNames[month.getMonth()]} ${month.getFullYear()}`;
  });

  readonly calendarClasses = computed(() => {
    // Uses clsx/tailwind-merge via cva under the hood from calendarVariants if we import cn
    return calendarVariants() + (this.customClass() ? ' ' + this.customClass() : '');
  });

  prevMonth(): void {
    const current = this.api().state.currentMonth;
    const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    if (!this.inputMonth()) {
      this.internalMonth.set(prev);
    }
    this.monthChange.emit(prev);
  }

  nextMonth(): void {
    const current = this.api().state.currentMonth;
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    if (!this.inputMonth()) {
      this.internalMonth.set(next);
    }
    this.monthChange.emit(next);
  }

  selectDate(date: Date): void {
    // If uncontrolled value (we shouldn't maintain full internal value state unless requested, but usually the parent updates value)
    // Actually, createCalendar handles selection logic via onSelect, but in Angular it's simpler to emit.
    this.valueChange.emit(date);
  }

  getDayClass(day: CalendarDay): string {
    let state: 'default' | 'selected' | 'today' | 'disabled' | 'outside' = 'default';
    if (day.isDisabled) state = 'disabled';
    else if (day.isSelected) state = 'selected';
    else if (!day.isCurrentMonth) state = 'outside';
    else if (day.isToday) state = 'today';
    return dayVariants({ state });
  }

  getDayAriaProps(day: CalendarDay) {
    return this.api().getDayAriaProps(day);
  }
}
