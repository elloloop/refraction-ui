import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  return (
    <button data-variant={variant} {...props} />
  );
};
