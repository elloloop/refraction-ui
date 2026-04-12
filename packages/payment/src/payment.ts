export interface PaymentProps {
  clientSecret?: string;
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