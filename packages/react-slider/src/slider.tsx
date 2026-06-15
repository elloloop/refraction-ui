import * as React from 'react';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default';
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <input 
        type="range"
        ref={ref}
        className={`w-full ${className || ''}`}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';
