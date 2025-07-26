/**
 * @refraction-version 1.1.0
 * @refraction-component button
 * @refraction-updated 2024-07-25
 */
export function Button({ label, variant }) {
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return `<button class="${cls}">${label}</button>`;
}
