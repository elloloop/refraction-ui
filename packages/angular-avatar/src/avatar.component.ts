import { Component, Input, HostBinding, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createAvatar, AvatarSize, AvatarAPI } from '@refraction-ui/avatar';

@Component({
  selector: 'refraction-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img *ngIf="api.state.hasSrc; else fallbackTemplate"
         [src]="src"
         [attr.alt]="api.imageProps.alt"
         [attr.role]="api.imageProps.role" />
    <ng-template #fallbackTemplate>
      <span class="refraction-avatar-fallback">{{ api.fallbackText }}</span>
    </ng-template>
  `,
})
export class RefractionAvatarComponent implements OnChanges {
  @Input() src?: string;
  @Input() alt?: string;
  @Input() fallback?: string;
  @Input() size?: AvatarSize;

  api!: AvatarAPI;

  constructor() {
    this.updateApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateApi();
  }

  private updateApi() {
    this.api = createAvatar({
      src: this.src,
      alt: this.alt,
      fallback: this.fallback,
      size: this.size,
    });
  }

  @HostBinding('attr.role')
  get role() {
    return this.api.ariaProps.role || null;
  }

  @HostBinding('attr.aria-label')
  get ariaLabel() {
    return this.api.ariaProps['aria-label'] || null;
  }

  @HostBinding('attr.data-slot')
  get dataSlot() {
    return this.api.dataAttributes['data-slot'] || null;
  }
}
