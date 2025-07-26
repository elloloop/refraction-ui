# Storybook

This folder contains Storybook stories and configuration. Add new component stories under `stories/` using the template below.

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from '../src/components/Component';

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
};
export default meta;

export const Primary: StoryObj<typeof Component> = {};
```
