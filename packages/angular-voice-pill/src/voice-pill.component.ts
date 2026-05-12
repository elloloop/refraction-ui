import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  createVoicePill,
  type VoicePillAPI,
  type VoicePillPosition,
  type VoicePillSpeaker,
  voicePillAvatarStyles,
  voicePillAvatarWrapStyles,
  voicePillLabelStyles,
  voicePillMuteButtonStyles,
  voicePillPositionVariants,
  voicePillPulseRingStyles,
  voicePillRootStyles,
  voicePillSpeakerStyles,
  voicePillSubStyles,
  voicePillTextStyles,
} from '@refraction-ui/voice-pill';

@Directive({
  selector: '[refractionVoicePillAvatar]',
  standalone: true,
})
export class RefractionVoicePillAvatarDirective {}

@Component({
  selector: 'refraction-voice-pill',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="containerClass"
      [ngStyle]="api.style"
      [attr.role]="api.ariaProps['role']"
      [attr.aria-live]="api.ariaProps['aria-live']"
      [attr.aria-atomic]="api.ariaProps['aria-atomic']"
      [attr.aria-label]="api.ariaProps['aria-label']"
      [attr.data-speaker]="api.dataAttributes['data-speaker']"
      [attr.data-muted]="api.dataAttributes['data-muted']"
      [attr.data-position]="api.dataAttributes['data-position']"
      [attr.data-intensity]="api.dataAttributes['data-intensity']"
      [attr.data-active]="api.dataAttributes['data-active']"
    >
      <div [class]="avatarWrapClass" aria-hidden="true">
        <span
          *ngIf="pulseRings && api.visualIntensity > 0"
          [class]="pulseRingClass"
          [style.animation-duration]="'var(--rfr-voice-pill-pulse-duration)'"
          [style.transform]="'scale(var(--rfr-voice-pill-ring-scale))'"
        ></span>
        <span
          *ngIf="pulseRings && api.visualIntensity > 0"
          [class]="pulseRingClass"
          [style.animation-delay]="'var(--rfr-voice-pill-pulse-delay)'"
          [style.animation-duration]="'var(--rfr-voice-pill-pulse-duration)'"
          [style.transform]="'scale(var(--rfr-voice-pill-ring-scale))'"
        ></span>
        <span [class]="avatarClass">
          <ng-container *ngIf="hasCustomAvatar; else initialsFallback">
            <ng-content select="[refractionVoicePillAvatar]"></ng-content>
          </ng-container>
          <ng-template #initialsFallback>{{ api.initials }}</ng-template>
        </span>
      </div>

      <div [class]="textClass">
        <span [class]="labelClass">{{ api.label }}</span>
        <span *ngIf="api.sub" [class]="subClass">{{ api.sub }}</span>
      </div>

      <button
        *ngIf="shouldShowMuteButton"
        type="button"
        [class]="muteButtonClass"
        [attr.aria-label]="api.toggleMuteAriaProps['aria-label']"
        [attr.aria-pressed]="api.toggleMuteAriaProps['aria-pressed']"
        (click)="handleMuteToggle()"
      >
        <svg
          aria-hidden="true"
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M4 9v6h4l5 4V5L8 9H4Z"></path>
          <ng-container *ngIf="api.muted; else unmutedIcon">
            <path d="m19 9-4 4"></path>
            <path d="m15 9 4 4"></path>
          </ng-container>
          <ng-template #unmutedIcon>
            <path d="M16 8.5a4 4 0 0 1 0 7"></path>
            <path d="M18.5 6a7 7 0 0 1 0 12"></path>
          </ng-template>
        </svg>
      </button>
    </div>
  `,
})
export class RefractionVoicePillComponent {
  @Input() speaker?: VoicePillSpeaker;
  @Input() label = '';
  @Input() sub?: string;
  @Input() subtitle?: string;
  @Input() intensity?: number;
  @Input() muted = false;
  @Input() position?: VoicePillPosition;
  @Input() pulseRings = true;
  @Input() showMuteButton = false;
  @Input() className?: string;

  @Output() muteToggle = new EventEmitter<void>();

  @ContentChild(RefractionVoicePillAvatarDirective)
  protected customAvatar?: RefractionVoicePillAvatarDirective;

  readonly avatarWrapClass = voicePillAvatarWrapStyles;
  readonly pulseRingClass = voicePillPulseRingStyles;
  readonly avatarClass = voicePillAvatarStyles;
  readonly textClass = voicePillTextStyles;
  readonly labelClass = voicePillLabelStyles;
  readonly subClass = voicePillSubStyles;
  readonly muteButtonClass = voicePillMuteButtonStyles;

  get api(): VoicePillAPI {
    return createVoicePill({
      speaker: this.speaker,
      label: this.label,
      sub: this.subtitle ?? this.sub,
      intensity: this.intensity,
      muted: this.muted,
      position: this.position,
      onToggleMute: () => this.muteToggle.emit(),
    });
  }

  get containerClass(): string {
    return [
      voicePillPositionVariants({ position: this.api.position }),
      voicePillRootStyles,
      voicePillSpeakerStyles,
      this.className,
    ].filter(Boolean).join(' ');
  }

  get hasCustomAvatar(): boolean {
    return this.customAvatar != null;
  }

  get shouldShowMuteButton(): boolean {
    return this.showMuteButton || this.muteToggle.observed;
  }

  handleMuteToggle(): void {
    this.api.toggleMute();
  }
}
