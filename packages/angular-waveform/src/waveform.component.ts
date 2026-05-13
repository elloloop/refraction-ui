import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  createWaveform,
  drawWaveform,
  prepareWaveformCanvas,
  smoothWaveformSamples,
  toCssDimension,
  type WaveformAPI,
  type WaveformSampleInput,
  type WaveformVariant,
  waveformCanvasVariants,
  waveformVariants,
} from '@refraction-ui/waveform';

@Component({
  selector: 'refraction-waveform',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #canvas
      [class]="canvasClass"
      [style.width]="cssWidth"
      [style.height]="cssHeight"
      aria-hidden="true"
      data-waveform-canvas=""
    ></canvas>
  `,
  host: {
    '[class]': 'hostClass',
    '[style.display]': '"block"',
    '[style.width]': 'cssWidth',
    '[style.height]': 'cssHeight',
    '[attr.role]': "api.ariaProps['role']",
    '[attr.aria-label]': "api.ariaProps['aria-label']",
    '[attr.data-variant]': "api.dataAttributes['data-variant']",
    '[attr.data-paused]': "api.dataAttributes['data-paused']",
  },
})
export class RefractionWaveformComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() samples?: WaveformSampleInput;
  @Input() intensity?: number;
  @Input() amplitude?: number;
  @Input() variant?: WaveformVariant;
  @Input() height?: number | string;
  @Input() width?: number | string;
  @Input() barCount?: number;
  @Input() smoothing?: number;
  @Input() color?: string;
  @Input() paused?: boolean;
  @Input() className?: string;

  @ViewChild('canvas') private canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private previousSamples?: Float32Array;
  private resizeObserver?: ResizeObserver;

  readonly canvasClass = waveformCanvasVariants();

  ngAfterViewInit(): void {
    this.draw();
    this.observeResize();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.draw();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  get api(): WaveformAPI {
    return createWaveform({
      samples: this.samples,
      intensity: this.intensity,
      amplitude: this.amplitude,
      variant: this.variant,
      height: this.height,
      width: this.width,
      barCount: this.barCount,
      smoothing: this.smoothing,
      color: this.color,
      paused: this.paused,
    });
  }

  get hostClass(): string {
    return [
      waveformVariants({ variant: this.api.config.variant }),
      this.className,
    ].filter(Boolean).join(' ');
  }

  get cssHeight(): string | undefined {
    return toCssDimension(this.api.config.height);
  }

  get cssWidth(): string | undefined {
    return toCssDimension(this.api.config.width);
  }

  private draw(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const api = this.api;
    const width = this.getPixelSize(canvas, 'width', api.config.width, 300);
    const height = this.getPixelSize(canvas, 'height', api.config.height, 80);
    const pixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    const context = prepareWaveformCanvas(canvas, { width, height, pixelRatio });

    if (!context) return;

    const samples = smoothWaveformSamples(
      this.previousSamples,
      api.samples,
      api.config.smoothing,
    );

    this.previousSamples = samples;

    drawWaveform(context, samples, { width, height }, {
      variant: api.config.variant,
      color: this.resolveCanvasColor(api.config.color),
      intensity: api.config.intensity,
      amplitude: api.config.amplitude,
      barCount: api.config.barCount,
    });
  }

  private observeResize(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.draw());
    this.resizeObserver.observe(this.hostRef.nativeElement);
  }

  private getPixelSize(
    canvas: HTMLCanvasElement,
    dimension: 'width' | 'height',
    value: number | string,
    fallback: number,
  ): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(1, value);
    }

    const rect = canvas.getBoundingClientRect();
    const measured = dimension === 'width' ? rect.width : rect.height;

    if (Number.isFinite(measured) && measured > 0) {
      return measured;
    }

    return fallback;
  }

  private resolveCanvasColor(color: string): string {
    const variableMatch = color.match(/^var\((--[^),\s]+)(?:,[^)]+)?\)$/);

    if (!variableMatch || typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
      return color;
    }

    return window.getComputedStyle(this.hostRef.nativeElement).getPropertyValue(variableMatch[1]).trim() || color;
  }
}
