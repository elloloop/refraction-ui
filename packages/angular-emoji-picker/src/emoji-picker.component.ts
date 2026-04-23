import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createEmojiPicker,
  emojiPickerContainerStyles,
  emojiPickerSearchStyles,
  emojiPickerCategoryBarStyles,
  emojiPickerCategoryTabVariants,
  emojiPickerGridStyles,
  emojiPickerEmojiButtonStyles,
  type EmojiEntry,
  type EmojiPickerAPI
} from '@refraction-ui/emoji-picker';

@Component({
  selector: 're-emoji-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass" [id]="api.ids.container" [attr.role]="api.ariaProps['role']" [attr.aria-labelledby]="api.ariaProps['aria-labelledby']">
      <!-- Search -->
      <div class="border-b">
        <input
          #searchInput
          [class]="searchClass"
          [attr.type]="api.searchInputProps['type']"
          [attr.role]="api.searchInputProps['role']"
          [attr.aria-label]="api.searchInputProps['aria-label']"
          [attr.placeholder]="api.searchInputProps['placeholder']"
          [id]="api.ids.search"
          [value]="api.state.search"
          (input)="handleSearch(searchInput.value)"
          autoComplete="off"
        />
      </div>

      <!-- Categories -->
      <div [class]="categoryBarClass">
        <button
          *ngFor="let tab of api.categoryTabs"
          type="button"
          [class]="getCategoryTabClass(tab.category)"
          [title]="tab.label"
          (click)="handleCategory(tab.category)"
        >
          {{ tab.emoji }}
        </button>
      </div>

      <!-- Grid -->
      <div [class]="gridClass" [id]="api.ids.grid">
        <button
          *ngFor="let emoji of api.state.filteredEmojis"
          type="button"
          [class]="emojiButtonClass"
          [attr.role]="api.getEmojiAriaProps(emoji)['role']"
          [attr.aria-label]="api.getEmojiAriaProps(emoji)['aria-label']"
          [attr.title]="api.getEmojiAriaProps(emoji)['title']"
          (click)="handleSelect(emoji)"
        >
          {{ emoji.emoji }}
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="api.state.filteredEmojis.length === 0" class="p-8 text-center text-sm text-muted-foreground">
        No emojis found
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmojiPickerComponent implements OnChanges {
  @Input() search: string = '';
  @Input() recentEmojis: EmojiEntry[] = [];
  @Input() maxRecent: number = 20;

  @Output() select = new EventEmitter<EmojiEntry>();
  @Output() searchChange = new EventEmitter<string>();

  api!: EmojiPickerAPI;

  constructor() {
    this.initApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['search'] || changes['recentEmojis'] || changes['maxRecent']) {
      this.initApi();
    }
  }

  private initApi() {
    this.api = createEmojiPicker({
      search: this.search,
      recentEmojis: this.recentEmojis,
      maxRecent: this.maxRecent,
      onSelect: (emoji) => this.select.emit(emoji)
    });
  }

  get containerClass(): string { return emojiPickerContainerStyles; }
  get searchClass(): string { return emojiPickerSearchStyles; }
  get categoryBarClass(): string { return emojiPickerCategoryBarStyles; }
  get gridClass(): string { return emojiPickerGridStyles; }
  get emojiButtonClass(): string { return emojiPickerEmojiButtonStyles; }

  getCategoryTabClass(category: string): string {
    return emojiPickerCategoryTabVariants({
      state: this.api.state.activeCategory === category ? 'active' : 'inactive'
    });
  }

  handleSearch(query: string) {
    this.api.setSearch(query);
    this.searchChange.emit(query);
    // Note: In this headless implementation, setSearch updates local closure but we need to refresh the state object
    // Since createEmojiPicker is a factory, we might need to recreate or the API should return a reactive state.
    // Looking at createEmojiPicker in emoji-picker.ts, the state is a snapshot.
    this.initApi(); 
  }

  handleCategory(category: any) {
    this.api.setCategory(category);
    this.initApi();
  }

  handleSelect(emoji: EmojiEntry) {
    this.api.select(emoji);
    this.initApi(); // To update recentEmojis if displayed (though not in this template yet)
  }
}
