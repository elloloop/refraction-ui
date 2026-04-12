export interface PaymentProps {
  disabled?: boolean;
}

export interface PaymentAPI {
  props: PaymentProps;
}

export function createPayment(props: PaymentProps = {}): PaymentAPI {
  return {
    props: {
      ...props,
      'data-slot': 'payment',
    } as PaymentProps & Record<string, unknown>,
  };
}
