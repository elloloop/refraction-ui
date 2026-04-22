import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[re-y-axis]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:g *ngFor="let tick of computedTicks" [attr.transform]="tick.transform">
      <svg:line [attr.x2]="-tickSize" stroke="currentColor" />
      <svg:text
        [attr.x]="-(tickSize + 6)"
        alignment-baseline="middle"
        text-anchor="end"
        font-size="12"
        fill="currentColor"
      >
        {{ tick.value }}
      </svg:text>
    </svg:g>
  `
})
export class YAxisComponent {
  @Input() ticks: (number | string)[] = [];
  @Input() scale!: (value: number | string) => number;
  @Input() tickSize: number = 6;

  get computedTicks() {
    if (!this.scale || !this.ticks) return [];
    return this.ticks.map(tick => {
      const y = this.scale(tick);
      return {
        value: tick,
        transform: \`translate(0,\${y})\`
      };
    });
  }
}
