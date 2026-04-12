import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { createTooltip, TooltipAPI } from '@refraction-ui/tooltip';
import { Side } from '@refraction-ui/shared';

@Component({
  selector: 'refraction-tooltip',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class TooltipComponent implements OnInit, OnChanges {
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() placement?: Side;
  @Input() delayDuration?: number;

  @Output() openChange = new EventEmitter<boolean>();

  public api!: TooltipAPI;

  ngOnInit() {
    this.api = createTooltip({
      open: this.open,
      defaultOpen: this.defaultOpen,
      placement: this.placement,
      delayDuration: this.delayDuration,
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
