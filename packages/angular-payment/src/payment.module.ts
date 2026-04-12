import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentComponent } from './payment.component.js';

@NgModule({
  declarations: [PaymentComponent],
  imports: [CommonModule],
  exports: [PaymentComponent]
})
export class PaymentModule {}
