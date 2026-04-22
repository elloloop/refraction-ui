import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createLinearScale, computeExtent, computeHistogramBins } from '@refraction-ui/charts';
import { ChartContextService } from './chart-context.service';

@Component({
  selector: '[re-histogram]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:rect
      *ngFor="let bin of computedBins"
      [attr.x]="bin.x"
      [attr.y]="bin.y"
      [attr.width]="bin.width"
      [attr.height]="bin.height"
      [attr.fill]="fill"
    />
  `
})
export class HistogramComponent<T = any> {
  @Input() data: T[] = [];
  @Input() value!: (d: T) => number;
  @Input() bins: number = 10;
  @Input() fill: string = 'currentColor';

  constructor(private contextService: ChartContextService) {}

  get computedBins() {
    const dimensions = this.contextService.context().dimensions;
    const { boundedWidth, boundedHeight } = dimensions;

    const data = this.data;
    if (!data || !data.length || !this.value) return [];

    const values = data.map(this.value);
    const [minVal, maxVal] = computeExtent(values);
    const histogramBins = computeHistogramBins(values, this.bins);
    const maxCount = Math.max(...histogramBins.map(b => b.count));

    const xScale = createLinearScale([minVal as number, maxVal as number], [0, boundedWidth]);
    const yScale = createLinearScale([0, maxCount], [boundedHeight, 0]);

    return histogramBins.map(bin => {
      const xPos = xScale(bin.x0);
      const width = Math.max(0, xScale(bin.x1) - xScale(bin.x0) - 1);
      const yPos = yScale(bin.count);
      const height = Math.max(0, boundedHeight - yPos);

      return { x: xPos, y: yPos, width, height };
    });
  }
}
