import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastProvider';

function TestComponent() {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast({ message: 'Hello', variant: 'success', duration: 100 })}>
      Add
    </button>
  );
}

test('renders and dismisses toast', async () => {
  jest.useFakeTimers();
  render(
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  );
  act(() => {
    screen.getByText('Add').click();
  });
  expect(await screen.findByRole('alert')).toHaveTextContent('Hello');
  act(() => {
    jest.advanceTimersByTime(150);
  });
  expect(screen.queryByRole('alert')).toBeNull();
  jest.useRealTimers();
});
