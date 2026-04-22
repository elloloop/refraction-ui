import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { arcPath } from '@refraction-ui/charts';
import { ChartContextService } from './chart-context.service';

@Component({
  selector: '[re-pie-chart]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:g [attr.transform]="transformString">
      <svg:g *ngFor="let arc of computedArcs">
        <svg:path [attr.d]="arc.path" [attr.fill]="arc.color" stroke="white" stroke-width="1" />
      </svg:g>
    </svg:g>
  `
})
export class PieChartComponent<T = any> {
  @Input() data: T[] = [];
  @Input() value!: (d: T) => number;
  @Input() label?: (d: T) => string;
  @Input() innerRadius: number = 0;
  @Input() colors?: string[];

  constructor(private contextService: ChartContextService) {}

  get transformString() {
    const dimensions = this.contextService.context().dimensions;
    const { boundedWidth, boundedHeight } = dimensions;
    return \`translate(\${boundedWidth / 2},\${boundedHeight / 2})\`;
  }

  get computedArcs() {
    const dimensions = this.contextService.context().dimensions;
    const { boundedWidth, boundedHeight } = dimensions;

    const data = this.data;
    if (!data || !data.length || !this.value) return [];

    const radius = Math.min(boundedWidth, boundedHeight) / 2;
    const values = data.map(this.value);
    const total = values.reduce((a, b) => a + b, 0);

    let currentAngle = 0;
    return data.map((d, i) => {
      const val = this.value(d);
      const startAngle = currentAngle;
      const endAngle = currentAngle + (val / total) * Math.PI * 2;
      currentAngle = endAngle;

      const path = arcPath({
        innerRadius: this.innerRadius,
        outerRadius: radius,
        startAngle,
        endAngle
      });

      return {
        path: path || '',
        label: this.label ? this.label(d) : '',
        color: this.colors && this.colors.length > 0 ? this.colors[i % this.colors.length] : 'currentColor'
      };
    });
  }
}
