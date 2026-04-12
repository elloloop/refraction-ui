import React from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPayment, type PaymentProps as CorePaymentProps, type PaymentProvider } from '@refraction-ui/payment';

export interface PaymentProps extends CorePaymentProps {
  provider?: PaymentProvider;
  stripeKey?: string;
  clientId?: string; // For PayPal or others
  children?: React.ReactNode;
}

const StripeForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
    });

    if (error) console.error(error);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      <button 
        type="submit" 
        disabled={!stripe} 
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Pay securely
      </button>
    </form>
  );
};

const StripePayment = ({ stripeKey, clientSecret }: { stripeKey?: string; clientSecret?: string }) => {
  const stripePromise = React.useMemo(() => stripeKey ? loadStripe(stripeKey) : null, [stripeKey]);

  if (!stripePromise || !clientSecret) {
    return <div className="p-4 text-sm text-destructive border border-destructive/20 rounded-md">Missing Stripe configuration (stripeKey or clientSecret).</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeForm />
    </Elements>
  );
};

const PaypalPayment = ({ clientId }: { clientId?: string }) => {
  if (!clientId) {
    return <div className="p-4 text-sm text-destructive border border-destructive/20 rounded-md">Missing PayPal configuration (clientId).</div>;
  }
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md">
      <p className="text-sm text-muted-foreground">PayPal integration placeholder. Render PayPal buttons here using your client ID: {clientId}</p>
      <button className="w-full rounded-md bg-[#0070ba] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005ea6]">
        Pay with PayPal
      </button>
    </div>
  );
};

export const Payment = React.forwardRef<HTMLDivElement, PaymentProps>(
  ({ provider = 'stripe', stripeKey, clientSecret, clientId, children, ...props }, ref) => {
    
    // Core headless setup logic (e.g. data attributes, states)
    const api = createPayment({ provider, clientSecret, clientId, ...props });

    return (
      <div ref={ref} className="w-full max-w-md mx-auto" {...api.props}>
        {provider === 'stripe' && <StripePayment stripeKey={stripeKey} clientSecret={clientSecret} />}
        {provider === 'paypal' && <PaypalPayment clientId={clientId} />}
        {provider === 'custom' && children}
      </div>
    );
  }
);

Payment.displayName = 'Payment';
