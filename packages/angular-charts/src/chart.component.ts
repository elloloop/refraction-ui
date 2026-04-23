import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineDimensions, type Margin } from '@refraction-ui/charts';
import { ChartContextService } from './chart-context.service';

@Component({
  selector: 're-chart',
  standalone: true,
  imports: [CommonModule],
  providers: [ChartContextService],
  template: `
    <svg [attr.width]="width" [attr.height]="height">
      <g [attr.transform]="transformString">
        <ng-content></ng-content>
      </g>
    </svg>
  `
})
export class ChartComponent implements OnChanges {
  @Input() width: number = 600;
  @Input() height: number = 400;
  @Input() margin?: Partial<Margin>;

  constructor(private contextService: ChartContextService) {
    this.updateDimensions();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateDimensions();
  }

  private updateDimensions() {
    const dimensions = combineDimensions({ 
      width: this.width, 
      height: this.height, 
      margin: this.margin 
    });
    this.contextService.context.set({ dimensions });
  }

  get transformString() {
    const margin = this.contextService.context().dimensions.margin;
    return \`translate(\${margin.left},\${margin.top})\`;
  }
}
