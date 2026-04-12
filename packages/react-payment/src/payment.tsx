import React from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { PaymentProps as CorePaymentProps } from '@refraction-ui/payment';

export interface PaymentProps extends CorePaymentProps {
  stripeKey: string;
}

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
    });

    if (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

export const Payment = ({ stripeKey, clientSecret }: PaymentProps) => {
  const stripePromise = React.useMemo(() => loadStripe(stripeKey), [stripeKey]);

  if (!clientSecret) {
    return <div>Missing clientSecret for Payment.</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm />
    </Elements>
  );
};
