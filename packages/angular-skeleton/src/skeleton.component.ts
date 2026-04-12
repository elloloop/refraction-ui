import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createSkeleton, type SkeletonShape, type SkeletonAPI } from '@refraction-ui/skeleton';

@Component({
  selector: 'refraction-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [attr.aria-hidden]="api.ariaProps['aria-hidden']"
      [attr.role]="api.ariaProps['role']"
      [attr.data-shape]="api.dataAttributes['data-shape']"
      [attr.data-animate]="api.dataAttributes['data-animate']"
      [style.width]="width"
      [style.height]="height"
    >
      <ng-container *ngIf="shape === 'text' && lines > 1; else single">
        <div *ngFor="let _ of getLinesArray()"></div>
      </ng-container>
      <ng-template #single>
        <ng-content></ng-content>
      </ng-template>
    </div>
  `
})
export class SkeletonComponent {
  @Input() shape: SkeletonShape = 'text';
  @Input() width?: string | number;
  @Input() height?: string | number;
  @Input() lines: number = 1;
  @Input() animate: boolean = true;

  get api(): SkeletonAPI {
    return createSkeleton({
      shape: this.shape,
      width: this.width,
      height: this.height,
      lines: this.lines,
      animate: this.animate
    });
  }

  getLinesArray(): number[] {
    return Array(this.lines).fill(0);
  }
}
