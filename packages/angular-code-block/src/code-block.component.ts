import { Component, Input, HostBinding } from '@angular/core'
import {
  createCodeBlock,
  createCodeBlockHeader,
  createCodeBlockContent,
  codeBlockVariants,
  codeBlockHeaderVariants,
  codeBlockContentVariants,
} from '@refraction-ui/code-block'
import { cn } from '@refraction-ui/shared'

@Component({
  selector: 'app-code-block, [app-code-block]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class CodeBlockComponent {
  @Input() class = ''

  private get api() {
    return createCodeBlock()
  }

  @HostBinding('class') get hostClass() {
    return cn(codeBlockVariants(), this.class)
  }

  @HostBinding('attr.data-slot') get dataSlot() {
    return this.api.dataAttributes['data-slot']
  }
}

@Component({
  selector: 'app-code-block-header, [app-code-block-header]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class CodeBlockHeaderComponent {
  @Input() class = ''

  private get api() {
    return createCodeBlockHeader()
  }

  @HostBinding('class') get hostClass() {
    return cn(codeBlockHeaderVariants(), this.class)
  }

  @HostBinding('attr.data-slot') get dataSlot() {
    return this.api.dataAttributes['data-slot']
  }
}

@Component({
  selector: 'app-code-block-content, [app-code-block-content]',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class CodeBlockContentComponent {
  @Input() class = ''

  private get api() {
    return createCodeBlockContent()
  }

  @HostBinding('class') get hostClass() {
    return cn(codeBlockContentVariants(), this.class)
  }

  @HostBinding('attr.data-slot') get dataSlot() {
    return this.api.dataAttributes['data-slot']
  }
}
