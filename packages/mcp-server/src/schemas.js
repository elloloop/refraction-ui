import { z } from 'zod';

export const authSchema = z.object({
  authToken: z.string(),
});

export const addComponentSchema = authSchema.merge(z.object({
  component: z.string(),
  variant: z.string().optional(),
  size: z.string().optional(),
  output: z.string().optional(),
}));

export const upgradeComponentSchema = authSchema.merge(z.object({
  path: z.string(),
  targetVersion: z.string().optional(),
}));

export const buildTokensSchema = authSchema.merge(z.object({}));

export const validateTokensSchema = authSchema.merge(z.object({}));

export const initProjectSchema = authSchema.merge(z.object({}));

export const a11yTestSchema = authSchema.merge(z.object({}));
