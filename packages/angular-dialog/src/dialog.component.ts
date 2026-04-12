import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { createDialog, DialogAPI } from '@refraction-ui/dialog';

@Component({
  selector: 'refraction-dialog',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class DialogComponent implements OnInit, OnChanges {
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() modal?: boolean;

  @Output() openChange = new EventEmitter<boolean>();

  public api!: DialogAPI;

  ngOnInit() {
    this.api = createDialog({
      open: this.open,
      defaultOpen: this.defaultOpen,
      modal: this.modal,
      onOpenChange: (open: boolean) => {
        this.openChange.emit(open);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.api) {
      if (changes['open'] && !changes['open'].firstChange) {
        if (this.open) {
          this.api.open();
        } else {
          this.api.close();
        }
      }
    }
  }
}
