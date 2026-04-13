import { Component } from '@angular/core';
import { CommandInputCore } from '@refraction-ui/command-input';

@Component({
  selector: 'ref-command-input',
  template: `
    <div class="refraction-command-input">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class CommandInputComponent {}
