import { Component, Input, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellConfig, resolveBreakpoint } from '@refraction-ui/app-shell';
import { AppShellService } from './app-shell.service';

@Component({
  selector: 're-app-shell',
  standalone: true,
  imports: [CommonModule],
  providers: [AppShellService],
  template: `
    <div 
      class="flex h-screen w-full overflow-hidden" 
      [ngStyle]="cssVariables()"
      [attr.data-shell]=""
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class AppShellComponent implements OnInit {
  @Input() config?: AppShellConfig;

  constructor(public shell: AppShellService) {}

  ngOnInit() {
    this.shell.init(this.config);
    this.updateBreakpoint();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateBreakpoint();
  }

  private updateBreakpoint() {
    if (typeof window === 'undefined') return;
    
    const width = window.innerWidth;
    const { mobileBreakpoint, tabletBreakpoint } = this.shell.apiInstance.config;
    const bp = resolveBreakpoint(width, mobileBreakpoint, tabletBreakpoint);
    this.shell.setBreakpoint(bp);
  }

  cssVariables() {
    return this.shell.getCSSVariables();
  }
}
