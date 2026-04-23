import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createCodeEditor,
  codeEditorVariants,
  type CodeEditorTheme,
  type CodeEditorAPI
} from '@refraction-ui/code-editor';

@Component({
  selector: 're-code-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="editorClass">
      <div class="re-code-editor-header" *ngIf="showLanguageLabel">
        <span class="re-code-editor-language">{{ api.getLanguageLabel() }}</span>
      </div>
      <textarea
        [value]="value"
        (input)="handleInput($event)"
        [readOnly]="readOnly"
        [attr.role]="api.ariaProps['role']"
        [attr.aria-multiline]="api.ariaProps['aria-multiline']"
        [attr.aria-label]="api.ariaProps['aria-label']"
        [attr.aria-readonly]="readOnly ? true : null"
        [attr.data-language]="api.dataAttributes['data-language']"
        [attr.data-theme]="api.dataAttributes['data-theme']"
        [attr.data-readonly]="readOnly ? '' : null"
        class="re-code-editor-textarea"
      ></textarea>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .re-code-editor-textarea {
      width: 100%;
      min-height: 200px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 14px;
      line-height: 1.5;
      padding: 1rem;
      border: none;
      outline: none;
      background: transparent;
      color: inherit;
      resize: vertical;
    }
    .re-code-editor-header {
      padding: 0.5rem 1rem;
      border-bottom: 1px solid currentColor;
      opacity: 0.7;
      font-size: 0.75rem;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class CodeEditorComponent implements OnChanges {
  @Input() value: string = '';
  @Input() language: string = 'plaintext';
  @Input() readOnly: boolean = false;
  @Input() theme: CodeEditorTheme = 'light';
  @Input() showLanguageLabel: boolean = true;

  @Output() valueChange = new EventEmitter<string>();

  api!: CodeEditorAPI;

  constructor() {
    this.initApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['language'] || changes['theme'] || changes['readOnly']) {
      this.initApi();
    }
  }

  private initApi() {
    this.api = createCodeEditor({
      value: this.value,
      language: this.language,
      readOnly: this.readOnly,
      theme: this.theme,
      onChange: (val) => {
        if (this.value !== val) {
          this.value = val;
          this.valueChange.emit(val);
        }
      }
    });
  }

  get editorClass(): string {
    return codeEditorVariants({ theme: this.theme });
  }

  handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.api.setValue(target.value);
  }
}
