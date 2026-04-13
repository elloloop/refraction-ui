import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createLocationSelector } from '@refraction-ui/location-selector';

@Component({
  selector: 'rfr-location-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="'flex flex-col gap-4 sm:flex-row ' + (className || '')">
      <div class="flex flex-col gap-1.5 flex-1">
        <label [for]="api.countryProps.id" class="text-sm font-medium">Country</label>
        <select
          [id]="api.countryProps.id"
          [name]="api.countryProps.name"
          [(ngModel)]="country"
          (ngModelChange)="onCountryChangeAction($event)"
          class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option *ngFor="let c of api.countries" [value]="c.code || c.id || c">
            {{ c.name || c.label || c }}
          </option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5 flex-1">
        <label [for]="api.languageProps.id" class="text-sm font-medium">Language</label>
        <select
          [id]="api.languageProps.id"
          [name]="api.languageProps.name"
          [(ngModel)]="language"
          (ngModelChange)="onLanguageChangeAction($event)"
          class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option *ngFor="let l of api.languages" [value]="l.code || l.id || l">
            {{ l.name || l.label || l }}
          </option>
        </select>
      </div>
    </div>
  `
})
export class LocationSelectorComponent implements OnInit {
  @Input() defaultCountry = 'US';
  @Input() defaultLanguage = 'en';
  @Input() className?: string;

  @Output() countryChange = new EventEmitter<string>();
  @Output() languageChange = new EventEmitter<string>();

  country = '';
  language = '';
  api: ReturnType<typeof createLocationSelector>;

  constructor() {
    this.api = createLocationSelector({
      defaultCountry: this.defaultCountry,
      defaultLanguage: this.defaultLanguage,
    });
  }

  ngOnInit() {
    this.country = this.defaultCountry;
    this.language = this.defaultLanguage;
    this.api = createLocationSelector({
      defaultCountry: this.defaultCountry,
      defaultLanguage: this.defaultLanguage,
    });
  }

  onCountryChangeAction(val: string) {
    this.api.setCountry(val);
    this.countryChange.emit(val);
  }

  onLanguageChangeAction(val: string) {
    this.api.setLanguage(val);
    this.languageChange.emit(val);
  }
}
