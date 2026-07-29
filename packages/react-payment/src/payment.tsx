import * as React from 'react';
import { createPayment, type PaymentProps as CorePaymentProps } from '@refraction-ui/payment';
import { cn } from '@refraction-ui/shared';

export interface PaymentProps extends React.HTMLAttributes<HTMLDivElement>, CorePaymentProps {
  disabled?: boolean;
}

export const Payment = React.forwardRef<HTMLDivElement, PaymentProps>(
  function Payment({ className, disabled, ...props }, ref) {
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

export interface PaymentHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PaymentHeader = React.forwardRef<HTMLDivElement, PaymentHeaderProps>(
  function PaymentHeader({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn("mb-6 flex flex-col gap-1.5", className)} {...props} />
    )
  }
);

export interface PaymentTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const PaymentTitle = React.forwardRef<HTMLHeadingElement, PaymentTitleProps>(
  function PaymentTitle({ className, ...props }, ref) {
    return (
      <h3 ref={ref} className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props} />
    )
  }
);

export interface PaymentDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const PaymentDescription = React.forwardRef<HTMLParagraphElement, PaymentDescriptionProps>(
  function PaymentDescription({ className, ...props }, ref) {
    return (
      <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
    )
  }
);

export interface PaymentContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PaymentContent = React.forwardRef<HTMLDivElement, PaymentContentProps>(
  function PaymentContent({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />
    )
  }
);

export interface PaymentFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PaymentFooter = React.forwardRef<HTMLDivElement, PaymentFooterProps>(
  function PaymentFooter({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn("mt-6 flex flex-col gap-3", className)} {...props} />
    )
  }
);

export interface PaymentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const PaymentButton = React.forwardRef<HTMLButtonElement, PaymentButtonProps>(
  function PaymentButton({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
);
