import { Component, Input, OnInit } from '@angular/core';
import type { PaymentProps } from '@refraction-ui/payment';

@Component({
  selector: 'ref-payment',
  template: `
    <div class="refraction-payment">
      <div id="payment-element-placeholder">Payment Element Placeholder (Angular)</div>
      <button>Pay</button>
    </div>
  `
})
export class PaymentComponent implements OnInit, PaymentProps {
  @Input() clientSecret?: string;
  @Input() stripeKey?: string;

  ngOnInit() {
    console.log('Stripe initialized in Angular component.');
  }
}
