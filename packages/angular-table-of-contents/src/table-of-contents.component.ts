import { Component, Input, ElementRef, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { parseHeadings, observeHeadings, TocItem } from '@refraction-ui/table-of-contents';
import { cn } from '@refraction-ui/shared';

@Component({
  selector: 'ref-table-of-contents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav [class]="computedClass">
      <ul class="m-0 list-none p-0" *ngIf="headings.length">
        <li *ngFor="let heading of headings" [ngClass]="getLiClass(heading)">
          <a
            [href]="'#' + heading.id"
            [ngClass]="getLinkClass(heading.id)"
          >
            {{ heading.text }}
          </a>
        </li>
      </ul>
    </nav>
  `
})
export class TableOfContentsComponent implements OnInit, OnDestroy {
  @Input() selectors = 'h2, h3, h4';
  @Input() class = '';
  
  headings: TocItem[] = [];
  activeId = '';
  private disconnectObserver?: () => void;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get computedClass() {
    return cn('space-y-1', this.class);
  }

  getLiClass(heading: TocItem) {
    return cn(
      'py-1',
      heading.level === 3 ? 'pl-4' : heading.level === 4 ? 'pl-8' : ''
    );
  }

  getLinkClass(id: string) {
    return cn(
      'block text-sm transition-colors hover:text-foreground',
      this.activeId === id ? 'font-medium text-foreground' : 'text-muted-foreground'
    );
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const container = document.body;
        this.headings = parseHeadings(container, this.selectors);
        
        if (this.headings.length > 0) {
          this.disconnectObserver = observeHeadings(
            this.headings.map(h => h.id),
            (id) => {
              this.activeId = id;
            }
          );
        }
      }, 0);
    }
  }

  ngOnDestroy() {
    if (this.disconnectObserver) {
      this.disconnectObserver();
    }
  }
}
