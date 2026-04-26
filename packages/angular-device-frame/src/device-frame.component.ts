import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createDeviceFrame,
  deviceFrameVariants,
  type DeviceType,
  type DeviceOrientation,
  type DeviceFrameAPI
} from '@refraction-ui/device-frame';

@Component({
  selector: 're-device-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="frameClass"
      [style.width.px]="api.dimensions.width"
      [style.height.px]="api.dimensions.height"
      [attr.role]="api.ariaProps['role']"
      [attr.aria-label]="api.ariaProps['aria-label']"
      [attr.data-device]="api.dataAttributes['data-device']"
      [attr.data-orientation]="api.dataAttributes['data-orientation']"
      [attr.data-notch]="api.dataAttributes['data-notch']"
      [attr.data-home-indicator]="api.dataAttributes['data-home-indicator']"
    >
      <!-- Notch (if applicable) -->
      <div 
        *ngIf="api.dimensions.notch" 
        class="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-40 bg-black rounded-b-2xl z-10"
      ></div>

      <!-- Content Area (Screen) -->
      <div class="h-full w-full bg-background overflow-auto">
        <ng-content></ng-content>
      </div>

      <!-- Home Indicator (if applicable) -->
      <div 
        *ngIf="api.dimensions.homeIndicator" 
        class="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-24 bg-foreground/20 rounded-full z-10"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    .bg-background {
      background-color: white; /* Fallback */
    }
    .dark .bg-background {
      background-color: #0a0a0a;
    }
  `]
})
export class DeviceFrameComponent implements OnChanges {
  @Input() device: DeviceType = 'iphone';
  @Input() orientation: DeviceOrientation = 'portrait';

  api!: DeviceFrameAPI;

  constructor() {
    this.updateApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['device'] || changes['orientation']) {
      this.updateApi();
    }
  }

  private updateApi() {
    this.api = createDeviceFrame({
      device: this.device,
      orientation: this.orientation
    });
  }

  get frameClass(): string {
    return deviceFrameVariants({
      device: this.device,
      orientation: this.orientation
    });
  }
}
