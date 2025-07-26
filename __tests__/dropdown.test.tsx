import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown, DropdownItem, DropdownSeparator } from '../src/Dropdown';
import { describe, it, expect, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

function setup() {
  render(
    <Dropdown trigger={<button>Open</button>}>
      <DropdownItem>Item 1</DropdownItem>
      <DropdownItem>Item 2</DropdownItem>
      <DropdownSeparator />
      <DropdownItem>Item 3</DropdownItem>
    </Dropdown>
  );
  return userEvent.setup();
}

describe('Dropdown', () => {
  it('opens and closes via click', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /open/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('navigates with keyboard', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /open/i }));
    const menu = screen.getByRole('menu');
    menu.focus();
    await user.keyboard('[ArrowDown]');
    expect(screen.getByText('Item 1')).toHaveFocus();
    await user.keyboard('[ArrowDown]');
    expect(screen.getByText('Item 2')).toHaveFocus();
    await user.keyboard('[ArrowUp]');
    expect(screen.getByText('Item 1')).toHaveFocus();
  });
});
