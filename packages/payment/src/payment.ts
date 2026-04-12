export type PaymentProvider = 'stripe' | 'paypal' | 'custom';

export interface PaymentProps {
  provider?: PaymentProvider;
  clientSecret?: string;
  clientId?: string;
  amount?: number;
  currency?: string;
}

export interface PaymentAPI {
  props: PaymentProps;
}

export function createPayment(props: PaymentProps): PaymentAPI {
  return {
    props,
  };
}
