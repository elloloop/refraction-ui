import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createBandScale, createLinearScale, computeExtent } from '@refraction-ui/charts';
import { ChartContextService } from './chart-context.service';

@Component({
  selector: '[re-bars]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:rect
      *ngFor="let bar of computedBars; let i = index"
      [attr.x]="bar.x"
      [attr.y]="bar.y"
      [attr.width]="bar.width"
      [attr.height]="bar.height"
      [attr.fill]="fill"
    />
  `
})
export class BarsComponent<T = any> {
  @Input() data: T[] = [];
  @Input() x!: (d: T) => string;
  @Input() y!: (d: T) => number;
  @Input() fill: string = 'currentColor';

  constructor(private contextService: ChartContextService) {}

  get computedBars() {
    const dimensions = this.contextService.context().dimensions;
    const { boundedWidth, boundedHeight } = dimensions;

    const data = this.data;
    if (!data || !data.length || !this.x || !this.y) return [];

    const labels = data.map(this.x);
    const values = data.map(this.y);
    const [, maxVal] = computeExtent(values);

    const xScale = createBandScale(labels, [0, boundedWidth], 0.1);
    const yScale = createLinearScale([0, maxVal], [boundedHeight, 0]);

    return data.map((d, i) => {
      const label = labels[i];
      const value = values[i];
      const barX = xScale(label);
      const barY = yScale(value);
      const barHeight = Math.max(0, boundedHeight - barY);
      const barWidth = Math.max(0, xScale.bandwidth());

      return { x: barX, y: barY, width: barWidth, height: barHeight };
    });
  }
}
