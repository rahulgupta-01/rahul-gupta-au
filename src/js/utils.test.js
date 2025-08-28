import { describe, it, expect } from 'vitest';
import { calcDays, escapeHTML } from './utils.js';

describe('calcDays', () => {
  it('calculates the correct number of days between two dates', () => {
    const d1 = '2024-01-01';
    const d2 = '2024-01-11';
    expect(calcDays(d1, d2)).toBe(10);
  });

  it('handles date objects as input', () => {
    const d1 = new Date('2024-01-01');
    const d2 = new Date('2024-01-11');
    expect(calcDays(d1, d2)).toBe(10);
  });

  it('returns 0 for the same day', () => {
    const d1 = '2024-03-15';
    const d2 = '2024-03-15';
    expect(calcDays(d1, d2)).toBe(0);
  });

  it('returns a negative number if the first date is later', () => {
    const d1 = '2024-02-01';
    const d2 = '2024-01-01';
    expect(calcDays(d1, d2)).toBe(-31);
  });
});

describe('escapeHTML', () => {
  it('escapes essential HTML characters', () => {
    const input = '<script>alert("XSS & Injection")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS &amp; Injection&quot;)&lt;/script&gt;';
    expect(escapeHTML(input)).toBe(expected);
  });

  it('returns a string when given a number', () => {
    expect(escapeHTML(123)).toBe('123');
  });

  it('handles an empty string', () => {
    expect(escapeHTML('')).toBe('');
  });
});