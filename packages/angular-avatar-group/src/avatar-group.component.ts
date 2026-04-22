import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createAvatarGroup,
  avatarVariants,
  avatarOverflowBadgeVariants,
  avatarPresenceDotVariants,
  avatarGroupStyles,
  avatarImageStyles,
  AvatarUser,
  AvatarSize,
  AvatarGroupAPI
} from '@refraction-ui/avatar-group';

@Component({
  selector: 're-avatar-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="groupStyles"
      [attr.role]="api.ariaProps['role']"
      [attr.aria-label]="api.ariaProps['aria-label']"
      [attr.id]="api.ariaProps['id']"
    >
      <div
        *ngFor="let user of api.visibleUsers"
        [class]="getAvatarClass()"
        [attr.role]="api.getAvatarAriaProps(user)['role']"
        [attr.aria-label]="api.getAvatarAriaProps(user)['aria-label']"
      >
        <img
          *ngIf="user.src; else fallbackTemplate"
          [src]="user.src"
          [alt]="user.name"
          [class]="imageStyles"
        />
        <ng-template #fallbackTemplate>
          <span>{{ api.getInitials(user.name) }}</span>
        </ng-template>
        
        <span
          *ngIf="user.status"
          [class]="getPresenceDotClass(user.status)"
        ></span>
      </div>

      <div
        *ngIf="api.overflowCount > 0"
        [class]="getOverflowBadgeClass()"
        [attr.role]="api.overflowBadgeProps['role']"
        [attr.aria-label]="api.overflowBadgeProps['aria-label']"
      >
        +{{ api.overflowCount }}
      </div>
    </div>
  `
})
export class AvatarGroupComponent implements OnChanges {
  @Input() users: AvatarUser[] = [];
  @Input() max?: number;
  @Input() size: AvatarSize = 'md';

  api!: AvatarGroupAPI;

  constructor() {
    this.updateApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateApi();
  }

  private updateApi() {
    this.api = createAvatarGroup({
      users: this.users,
      max: this.max,
      size: this.size
    });
  }

  get groupStyles(): string {
    return avatarGroupStyles;
  }

  get imageStyles(): string {
    return avatarImageStyles;
  }

  getAvatarClass(): string {
    return avatarVariants({ size: this.size });
  }

  getOverflowBadgeClass(): string {
    return avatarOverflowBadgeVariants({ size: this.size });
  }

  getPresenceDotClass(status: 'online' | 'offline' | 'away' | 'busy' | 'dnd'): string {
    return avatarPresenceDotVariants({ size: this.size, status });
  }
}
