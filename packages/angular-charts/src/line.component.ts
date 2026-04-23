import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { linePath, areaPath, createLinearScale, createTimeScale, computeExtent } from '@refraction-ui/charts';
import { ChartContextService } from './chart-context.service';

@Component({
  selector: '[re-line]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:path *ngIf="computedArea" [attr.d]="computedArea" [attr.fill]="fill" opacity="0.2" />
    <svg:path [attr.d]="computedPath" fill="none" [attr.stroke]="stroke" [attr.stroke-width]="strokeWidth" />
  `
})
export class LineComponent<T = any> {
  @Input() data: T[] = [];
  @Input() x!: (d: T) => number | Date;
  @Input() y!: (d: T) => number;
  @Input() curve: 'linear' | 'monotoneX' | 'step' = 'monotoneX';
  @Input() stroke: string = 'currentColor';
  @Input() fill?: string;
  @Input() strokeWidth: number = 2;
  @Input() isDate: boolean = false;

  constructor(private contextService: ChartContextService) {}

  get scaleData() {
    const dimensions = this.contextService.context().dimensions;
    const { boundedWidth, boundedHeight } = dimensions;

    const data = this.data;
    if (!data || !data.length || !this.x || !this.y) return null;

    const xVals = data.map(this.x);
    const yVals = data.map(this.y);
    const [minX, maxX] = computeExtent(xVals as number[]);
    const [minY, maxY] = computeExtent(yVals);

    const xScale = this.isDate 
      ? createTimeScale([minX as number, maxX as number], [0, boundedWidth]) 
      : createLinearScale([minX as number, maxX as number], [0, boundedWidth]);
    
    const yScale = createLinearScale([minY as number, maxY as number], [boundedHeight, 0]);

    return { xScale, yScale, boundedHeight };
  }

  get computedPath(): string {
    const scales = this.scaleData;
    if (!scales) return '';
    const { xScale, yScale } = scales;
    return linePath(this.data, (d: T) => xScale(this.x(d) as any), (d: T) => yScale(this.y(d)), this.curve) || '';
  }

  get computedArea(): string | null {
    if (!this.fill) return null;
    const scales = this.scaleData;
    if (!scales) return null;
    const { xScale, yScale, boundedHeight } = scales;
    return areaPath(this.data, (d: T) => xScale(this.x(d) as any), (d: T) => yScale(this.y(d)), boundedHeight, this.curve) || null;
  }
}
