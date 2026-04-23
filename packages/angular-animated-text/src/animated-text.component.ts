import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { createAnimatedText, type AnimatedTextAPI } from '@refraction-ui/animated-text';

@Component({
  selector: 're-animated-text',
  standalone: true,
  template: `
    <span aria-live="polite" aria-atomic="true" [attr.data-state]="isExiting ? 'exiting' : 'entering'">
      {{ currentWord }}
    </span>
  `,
})
export class AnimatedTextComponent implements OnInit, OnChanges, OnDestroy {
  @Input() words: string[] = [];
  @Input() interval = 2500;
  @Input() transitionDuration = 1000;

  @Output() currentIndexChange = new EventEmitter<number>();

  currentWord = '';
  isExiting = false;

  private api: AnimatedTextAPI = createAnimatedText({ words: [] });
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private transitionId: ReturnType<typeof setTimeout> | null = null;

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

    this.api = createAnimatedText({
      words: this.words,
      interval: this.interval,
      transitionDuration: this.transitionDuration,
    });

    this.currentWord = this.api.getCurrentWord();
    this.currentIndexChange.emit(this.api.state.currentIndex);

    if (this.words.length <= 1) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.isExiting = true;

      const delay = Math.max(0, Math.floor(this.transitionDuration / 2));
      this.transitionId = setTimeout(() => {
        this.api.state.currentIndex = this.api.getNextIndex();
        this.currentWord = this.api.getCurrentWord();
        this.currentIndexChange.emit(this.api.state.currentIndex);
        this.isExiting = false;
      }, delay);
    }, this.interval);
  }

  private clearTimers(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.transitionId) {
      clearTimeout(this.transitionId);
      this.transitionId = null;
    }
  }
}
