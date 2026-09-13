import { describe, expect, it } from 'vitest';
import { avocadoBrag, avocadoCount, inAvocados } from '@/lib/domain/avocado';

describe('counting in avocados', () => {
  it('turns a lift into something you can picture', () => {
    expect(avocadoCount(40)).toBe(200);
    expect(inAvocados(40)).toBe('200 אבוקדו');
  });

  it('says nothing at all rather than saying zero', () => {
    for (const value of [0, -5, 0.05, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(inAvocados(value), String(value)).toBeNull();
      expect(avocadoBrag(value), String(value)).toBeNull();
    }
  });

  it('gets the grammar right for one', () => {
    expect(inAvocados(0.2)).toBe('אבוקדו אחד');
  });

  /*
   * The joke only works while the number stays picturable. Nobody can see
   * 12,000 avocados, so past a point it moves up to crates and then gives up
   * honestly rather than printing a number that means nothing.
   */
  it('moves up a container when the count stops being picturable', () => {
    expect(avocadoBrag(5)).toBe('25 אבוקדו');
    expect(avocadoBrag(100)).toMatch(/ארגזי אבוקדו/);
    expect(avocadoBrag(10_000)).toBe('מטע שלם');
  });
});
