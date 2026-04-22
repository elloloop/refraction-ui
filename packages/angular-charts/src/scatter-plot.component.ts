import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createLinearScale, computeExtent } from '@refraction-ui/charts';
import { ChartContextService } from './chart-context.service';

@Component({
  selector: '[re-scatter-plot]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:circle
      *ngFor="let point of computedPoints"
      [attr.cx]="point.cx"
      [attr.cy]="point.cy"
      [attr.r]="radius"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      [attr.stroke-width]="strokeWidth"
    />
  `
})
export class ScatterPlotComponent<T = any> {
  @Input() data: T[] = [];
  @Input() x!: (d: T) => number;
  @Input() y!: (d: T) => number;
  @Input() radius: number = 4;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = 'none';
  @Input() strokeWidth: number = 0;

  constructor(private contextService: ChartContextService) {}

  get computedPoints() {
    const dimensions = this.contextService.context().dimensions;
    const { boundedWidth, boundedHeight } = dimensions;

    const data = this.data;
    if (!data || !data.length || !this.x || !this.y) return [];

    const xVals = data.map(this.x);
    const yVals = data.map(this.y);
    const [minX, maxX] = computeExtent(xVals);
    const [minY, maxY] = computeExtent(yVals);

    const xScale = createLinearScale([minX as number, maxX as number], [0, boundedWidth]);
    const yScale = createLinearScale([minY as number, maxY as number], [boundedHeight, 0]);

    return data.map(d => ({
      cx: xScale(this.x(d)),
      cy: yScale(this.y(d))
    }));
  }
}
