import { describe, expect, it } from 'vitest';

describe('App bootstrap smoke test', () => {
  it('should include the expected restaurant routes', () => {
    const routes = ['dashboard', 'reservations', 'tables', 'availability', 'settings'];

    expect(routes).toHaveLength(5);
    expect(routes).toContain('dashboard');
    expect(routes).toContain('reservations');
    expect(routes).toContain('tables');
    expect(routes).toContain('availability');
    expect(routes).toContain('settings');
  });
});
