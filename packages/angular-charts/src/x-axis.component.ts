import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[re-x-axis]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:g [attr.transform]="transformString">
      <svg:g *ngFor="let tick of computedTicks" [attr.transform]="tick.transform">
        <svg:line [attr.y2]="tickSize" stroke="currentColor" />
        <svg:text
          [attr.y]="tickSize + 9"
          text-anchor="middle"
          font-size="12"
          fill="currentColor"
        >
          {{ tick.value }}
        </svg:text>
      </svg:g>
    </svg:g>
  `
})
export class XAxisComponent {
  @Input() ticks: (number | string)[] = [];
  @Input() scale!: (value: number | string) => number;
  @Input() height: number = 0;
  @Input() tickSize: number = 6;

  get transformString() {
    return \`translate(0,\${this.height})\`;
  }

  get computedTicks() {
    if (!this.scale || !this.ticks) return [];
    return this.ticks.map(tick => {
      const x = this.scale(tick);
      return {
        value: tick,
        transform: \`translate(\${x},0)\`
      };
    });
  }
}
