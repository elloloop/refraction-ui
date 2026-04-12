import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { createTabs, TabsAPI } from '@refraction-ui/tabs';

@Component({
  selector: 'refraction-tabs',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class TabsComponent implements OnInit, OnChanges {
  @Input() value?: string;
  @Input() defaultValue?: string;
  @Input() orientation?: 'horizontal' | 'vertical';

  @Output() valueChange = new EventEmitter<string>();

  public api!: TabsAPI;

  ngOnInit() {
    this.api = createTabs({
      value: this.value,
      defaultValue: this.defaultValue,
      orientation: this.orientation,
      onValueChange: (val: string) => {
        this.valueChange.emit(val);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.api) {
      if (changes['value'] && !changes['value'].firstChange) {
        if (this.value !== undefined) {
          this.api.select(this.value);
        }
      }
    }
  }
}
