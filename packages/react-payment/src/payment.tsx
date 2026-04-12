import * as React from 'react';
import { createPayment, type PaymentProps as CorePaymentProps } from '@refraction-ui/payment';
import { cn } from '@refraction-ui/shared';

export interface PaymentProps extends React.HTMLAttributes<HTMLDivElement>, CorePaymentProps {}

export const Payment = React.forwardRef<HTMLDivElement, PaymentProps>(
  ({ className, disabled, ...props }, ref) => {
    const api = createPayment({ disabled });

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-md mx-auto p-6 border border-border rounded-xl bg-card text-card-foreground shadow-sm",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...api.props}
        {...props}
      />
    );
  }
);
Payment.displayName = 'Payment';

export interface PaymentHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PaymentHeader = React.forwardRef<HTMLDivElement, PaymentHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-6 flex flex-col gap-1.5", className)} {...props} />
  )
);
PaymentHeader.displayName = 'PaymentHeader';

export interface PaymentTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const PaymentTitle = React.forwardRef<HTMLHeadingElement, PaymentTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
PaymentTitle.displayName = 'PaymentTitle';

export interface PaymentDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const PaymentDescription = React.forwardRef<HTMLParagraphElement, PaymentDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
PaymentDescription.displayName = 'PaymentDescription';

export interface PaymentContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PaymentContent = React.forwardRef<HTMLDivElement, PaymentContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />
  )
);
PaymentContent.displayName = 'PaymentContent';

export interface PaymentFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PaymentFooter = React.forwardRef<HTMLDivElement, PaymentFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-6 flex flex-col gap-3", className)} {...props} />
  )
);
PaymentFooter.displayName = 'PaymentFooter';

export interface PaymentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const PaymentButton = React.forwardRef<HTMLButtonElement, PaymentButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
PaymentButton.displayName = 'PaymentButton';
