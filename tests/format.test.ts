import { describe, it, expect } from 'vitest';
import { formatDate } from '../src/lib/format';

describe('formatDate', () => {
  it('formats as day, short month, year', () => {
    expect(formatDate(new Date('2026-10-21'))).toBe('21 Oct 2026');
  });
  it('uses UTC, so late-evening UTC dates do not roll over', () => {
    expect(formatDate(new Date('2026-10-21T23:30:00Z'))).toBe('21 Oct 2026');
  });
});
