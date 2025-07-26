import { SimpleEngineAdapter } from '../src/SimpleEngineAdapter';

describe('SimpleEngineAdapter', () => {
  it('registers and retrieves components', () => {
    const adapter = new SimpleEngineAdapter();
    const cmp = () => null;
    adapter.registerComponent('foo', cmp);
    expect(adapter.getComponent('foo')).toBe(cmp);
  });

  it('applies and retrieves theme', () => {
    const adapter = new SimpleEngineAdapter();
    adapter.applyTheme({ color: 'red' });
    expect(adapter.getTheme()).toEqual({ color: 'red' });
  });

  it('supports composition', () => {
    const adapter = new SimpleEngineAdapter();
    const cmp = () => 'ok';
    expect(adapter.compose(cmp)()).toBe('ok');
  });
});
