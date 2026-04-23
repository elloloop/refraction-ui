import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { createTypewriter, type TypewriterAPI } from '@refraction-ui/animated-text';

@Component({
  selector: 're-typewriter-text',
  standalone: true,
  template: `<span [attr.aria-label]="text">{{ visibleText }}</span>`,
})
export class TypewriterTextComponent implements OnInit, OnChanges, OnDestroy {
  @Input() text = '';
  @Input() speed = 50;
  @Input() startDelay = 0;

  @Output() complete = new EventEmitter<void>();

  visibleText = '';

  private api: TypewriterAPI = createTypewriter({ text: '' });
  private startTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private tickTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.setupAndStart();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.setupAndStart();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private setupAndStart(): void {
    this.clearTimers();

    this.api = createTypewriter({
      text: this.text,
      speed: this.speed,
      startDelay: this.startDelay,
    });

    this.visibleText = this.api.getVisibleText();

    this.startTimeoutId = setTimeout(() => {
      this.tick();
    }, this.startDelay);
  }

  private tick(): void {
    if (this.api.isComplete()) {
      this.complete.emit();
      return;
    }

    this.api.state.currentIndex += 1;
    this.visibleText = this.api.getVisibleText();

    this.tickTimeoutId = setTimeout(() => {
      this.tick();
    }, this.speed);
  }

  private clearTimers(): void {
    if (this.startTimeoutId) {
      clearTimeout(this.startTimeoutId);
      this.startTimeoutId = null;
    }

    if (this.tickTimeoutId) {
      clearTimeout(this.tickTimeoutId);
      this.tickTimeoutId = null;
    }
  }
}
