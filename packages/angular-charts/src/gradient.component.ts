import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[re-gradient]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:defs>
      <svg:linearGradient [attr.id]="id" [attr.x1]="x1" [attr.y1]="y1" [attr.x2]="x2" [attr.y2]="y2">
        <svg:stop *ngFor="let color of colors; let i = index" [attr.offset]="getOffset(i)" [attr.stop-color]="color" />
      </svg:linearGradient>
    </svg:defs>
  `
})
export class GradientComponent {
  @Input() id!: string;
  @Input() colors: string[] = [];
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';

  get x1() { return '0%'; }
  get y1() { return '0%'; }
  get x2() { return this.direction === 'horizontal' ? '100%' : '0%'; }
  get y2() { return this.direction === 'vertical' ? '100%' : '0%'; }

  getOffset(index: number): string {
    if (this.colors.length <= 1) return '0%';
    return \`\${(index / (this.colors.length - 1)) * 100}%\`;
  }
}
