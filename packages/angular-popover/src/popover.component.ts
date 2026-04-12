import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { createPopover, PopoverAPI } from '@refraction-ui/popover';
import { Side } from '@refraction-ui/shared';

@Component({
  selector: 'refraction-popover',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class PopoverComponent implements OnInit, OnChanges {
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() placement?: Side;

  @Output() openChange = new EventEmitter<boolean>();

  public api!: PopoverAPI;

  ngOnInit() {
    this.api = createPopover({
      open: this.open,
      defaultOpen: this.defaultOpen,
      placement: this.placement,
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
