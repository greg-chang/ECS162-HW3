import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFormattedDate, type FormattedDate } from './dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 3, 29)); // Note: month is 0-based, so 3 = April
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns correctly formatted date', () => {
    const result = getFormattedDate();
    
    expect(result).toEqual({
      currentDate: 'Tuesday, April 29, 2025',
      dayName: 'Tuesday',
      monthName: 'April',
      dayOfMonth: '29',
      year: '2025'
    });
  });

  it('returns correct day name', () => {
    const result = getFormattedDate();
    expect(result.dayName).toBe('Tuesday');
  });

  it('returns correct month name', () => {
    const result = getFormattedDate();
    expect(result.monthName).toBe('April');
  });

  it('returns correct day of month', () => {
    const result = getFormattedDate();
    expect(result.dayOfMonth).toBe('29');
  });

  it('returns correct year', () => {
    const result = getFormattedDate();
    expect(result.year).toBe('2025');
  });
});
