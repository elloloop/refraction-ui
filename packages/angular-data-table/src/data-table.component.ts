import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import {
  createDataTable,
  type ColumnDef,
  type SortDirection,
  tableVariants,
  headerVariants,
  cellVariants,
  rowVariants,
} from '@refraction-ui/data-table';

export interface SortChangeEvent {
  columnId: string;
  direction: SortDirection;
}

@Component({
  selector: 're-data-table',
  standalone: true,
  template: `
    <div [class]="customClass()" style="overflow-x: auto;">
      <table [class]="tableClass()" role="grid" [attr.aria-label]="ariaLabel()">
        <!-- Header -->
        <thead>
          <tr role="row">
            @for (col of columns(); track col.id) {
            <th
              [class]="getHeaderClass(col)"
              [attr.role]="'columnheader'"
              [attr.aria-sort]="getHeaderAriaSort(col)"
              [attr.data-column]="col.id"
              (click)="col.sortable ? onSort(col.id) : null"
            >
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                {{ col.header }}
                @if (col.sortable) {
                  <span aria-hidden="true" style="font-size: 10px; opacity: 0.6;">
                    {{ getSortIndicator(col.id) }}
                  </span>
                }
              </span>
              @if (col.filterable) {
                <div style="margin-top: 4px;">
                  <input
                    type="text"
                    [value]="getFilterValue(col.id)"
                    (input)="onFilterInput(col.id, $event)"
                    [attr.aria-label]="'Filter ' + col.header"
                    placeholder="Filter..."
                    style="width: 100%; font-size: 11px; padding: 2px 4px; border: 1px solid currentColor; border-radius: 3px; background: transparent;"
                  />
                </div>
              }
            </th>
            }
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          @for (row of sortedData(); track rowTrackId(row, $index)) {
          <tr
            [class]="rowClass()"
            [attr.role]="'row'"
            [attr.data-row-index]="$index"
          >
            @for (col of columns(); track col.id) {
            <td
              [class]="cellClass()"
              role="cell"
              [attr.data-column]="col.id"
            >
              {{ getCellValue(col, row) }}
            </td>
            }
          </tr>
          } @empty {
          <tr role="row">
            <td
              [attr.colspan]="columns().length"
              [class]="cellClass()"
              style="text-align: center; opacity: 0.5;"
              role="cell"
            >
              No data
            </td>
          </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataTableComponent {
  // ── Signals for inputs ──────────────────────────────────────────────────
  readonly columns = signal<ColumnDef[]>([]);
  @Input('columns') set _columns(val: ColumnDef[]) {
    this.columns.set(val ?? []);
  }

  readonly data = signal<Record<string, unknown>[]>([]);
  @Input('data') set _data(val: Record<string, unknown>[]) {
    this.data.set(val ?? []);
  }

  readonly sortByInput = signal<string | undefined>(undefined);
  @Input('sortBy') set _sortBy(val: string | undefined) {
    this.sortByInput.set(val);
    // sync internal state
    if (val !== undefined) this._internalSortBy.set(val);
  }

  readonly sortDirInput = signal<SortDirection>('asc');
  @Input('sortDir') set _sortDir(val: SortDirection) {
    this.sortDirInput.set(val ?? 'asc');
    this._internalSortDir.set(val ?? 'asc');
  }

  readonly filtersInput = signal<Record<string, string>>({});
  @Input('filters') set _filters(val: Record<string, string>) {
    this.filtersInput.set(val ?? {});
    this._internalFilters.set(val ?? {});
  }

  readonly customClass = signal<string>('');
  @Input('class') set _class(val: string) {
    this.customClass.set(val ?? '');
  }

  readonly _ariaLabel = signal<string>('Data table');
  @Input('ariaLabel') set __ariaLabel(val: string) {
    this._ariaLabel.set(val ?? 'Data table');
  }

  // ── Outputs ──────────────────────────────────────────────────────────────
  @Output() sortChange = new EventEmitter<SortChangeEvent>();
  @Output() filterChange = new EventEmitter<{ columnId: string; value: string }>();

  // ── Internal reactive state ───────────────────────────────────────────
  readonly _internalSortBy = signal<string | undefined>(undefined);
  readonly _internalSortDir = signal<SortDirection>('asc');
  readonly _internalFilters = signal<Record<string, string>>({});

  // ── Computed API ─────────────────────────────────────────────────────
  readonly api = computed(() => {
    return createDataTable({
      columns: this.columns(),
      data: this.data(),
      sortBy: this._internalSortBy(),
      sortDir: this._internalSortDir(),
      filters: this._internalFilters(),
      onSort: (columnId: string, direction: SortDirection) => {
        this.sortChange.emit({ columnId, direction });
      },
    });
  });

  readonly sortedData = computed(() => this.api().state.sortedData);
  readonly ariaLabel = computed(() => this._ariaLabel());

  // ── CSS class helpers ────────────────────────────────────────────────
  readonly tableClass = computed(() => tableVariants());
  rowClass() { return rowVariants({ selected: 'false' }); }
  cellClass() { return cellVariants(); }

  getHeaderClass(col: ColumnDef): string {
    return headerVariants({ sortable: col.sortable ? 'true' : 'false' });
  }

  // ── Sort ─────────────────────────────────────────────────────────────
  onSort(columnId: string): void {
    const currentSortBy = this._internalSortBy();
    const currentDir = this._internalSortDir();

    let newDir: SortDirection = 'asc';
    if (currentSortBy === columnId) {
      newDir = currentDir === 'asc' ? 'desc' : 'asc';
    }

    this._internalSortBy.set(columnId);
    this._internalSortDir.set(newDir);

    this.sortChange.emit({ columnId, direction: newDir });
  }

  getHeaderAriaSort(col: ColumnDef): string | null {
    if (!col.sortable) return null;
    const sortBy = this._internalSortBy();
    if (sortBy !== col.id) return 'none';
    return this._internalSortDir() === 'asc' ? 'ascending' : 'descending';
  }

  getSortIndicator(columnId: string): string {
    if (this._internalSortBy() !== columnId) return '⇅';
    return this._internalSortDir() === 'asc' ? '↑' : '↓';
  }

  // ── Filter ───────────────────────────────────────────────────────────
  onFilterInput(columnId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const current = { ...this._internalFilters() };
    current[columnId] = value;
    this._internalFilters.set(current);
    this.filterChange.emit({ columnId, value });
  }

  getFilterValue(columnId: string): string {
    return this._internalFilters()[columnId] ?? '';
  }

  // ── Cell value ───────────────────────────────────────────────────────
  getCellValue(col: ColumnDef, row: Record<string, unknown>): string {
    const val = col.accessor(row);
    return val != null ? String(val) : '';
  }

  // ── Row tracking ─────────────────────────────────────────────────────
  rowTrackId(row: Record<string, unknown>, index: number): unknown {
    return (row['id'] as unknown) ?? index;
  }
}
