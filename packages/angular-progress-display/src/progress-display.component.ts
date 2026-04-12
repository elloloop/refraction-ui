import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createProgressDisplay, type StatCardData, type BadgeData, type ProgressDisplayAPI } from '@refraction-ui/progress-display';

@Component({
  selector: 'refraction-progress-display',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [attr.role]="api.ariaProps['role']" [attr.aria-label]="api.ariaProps['aria-label']">
      
      <!-- Stats -->
      <div class="stats-grid">
        <div *ngFor="let stat of api.stats" class="stat-card">
          <span>{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
          <span *ngIf="stat.icon">{{ stat.icon }}</span>
        </div>
      </div>

      <!-- Level & Accuracy (if provided) -->
      <div *ngIf="level !== undefined" class="level-indicator">
        Level: {{ level }}
      </div>
      <div *ngIf="accuracy !== undefined" class="accuracy-indicator">
        Accuracy: {{ accuracy }}%
      </div>

      <!-- Badges -->
      <div class="badges-grid">
        <div *ngFor="let badge of api.badges" 
             class="badge-card" 
             [attr.aria-label]="api.getBadgeAriaProps(badge)['aria-label']"
             [class.locked]="!badge.isUnlocked">
          <span>{{ badge.icon }}</span>
          <h4>{{ badge.name }}</h4>
          <p>{{ badge.description }}</p>
          <small *ngIf="badge.unlockedAt">{{ badge.unlockedAt }}</small>
        </div>
      </div>

    </div>
  `
})
export class ProgressDisplayComponent {
  @Input() stats: StatCardData[] = [];
  @Input() badges: BadgeData[] = [];
  @Input() level?: number;
  @Input() accuracy?: number;

  get api(): ProgressDisplayAPI {
    return createProgressDisplay({
      stats: this.stats,
      badges: this.badges,
      level: this.level,
      accuracy: this.accuracy
    });
  }
}
