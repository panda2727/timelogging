import { describe, it, expect } from 'vitest';
import { parseVoiceEntry } from './voiceParsing';

describe('parseVoiceEntry', () => {
  // ── With colons (typed / copy-paste input) ────────────────────────────────

  it('full entry with colons', () => {
    const r = parseVoiceEntry(
      'from 7 am to 9 am, category: faith, sub-category: bible, description: ESV version',
    );
    expect(r.startTime).toBe('07:00');
    expect(r.endTime).toBe('09:00');
    expect(r.category).toBe('faith');
    expect(r.subCategory).toBe('Bible');
    expect(r.description).toBe('ESV version');
  });

  // ── Without colons (real Web Speech API output) ───────────────────────────

  it('full entry without colons — comma separated', () => {
    const r = parseVoiceEntry(
      'from 7 am to 9 am, category faith, sub-category bible, description ESV version',
    );
    expect(r.startTime).toBe('07:00');
    expect(r.endTime).toBe('09:00');
    expect(r.category).toBe('faith');
    expect(r.subCategory).toBe('Bible');
    expect(r.description).toBe('ESV version');
  });

  it('full entry without colons and no commas', () => {
    const r = parseVoiceEntry(
      'from 7 am to 9 am category faith sub category bible description ESV version',
    );
    expect(r.startTime).toBe('07:00');
    expect(r.endTime).toBe('09:00');
    expect(r.category).toBe('faith');
    expect(r.subCategory).toBe('Bible');
    expect(r.description).toBe('ESV version');
  });

  it('spoken "colon" as a word', () => {
    const r = parseVoiceEntry(
      'from 9 am to 10 am, category colon work, sub-category colon meeting, description colon quarterly review',
    );
    expect(r.category).toBe('work');
    expect(r.subCategory).toBe('Meeting');
    expect(r.description).toBe('Quarterly review');
  });

  // ── All five categories ───────────────────────────────────────────────────

  it('detects all five categories', () => {
    for (const cat of ['self', 'routine', 'faith', 'work', 'family'] as const) {
      expect(parseVoiceEntry(`from 9 to 10, category ${cat}`).category).toBe(cat);
    }
  });

  it('labels are case-insensitive', () => {
    const r = parseVoiceEntry('from 9 am to 10 am, Category Work, Sub-Category meeting, Description quarterly review');
    expect(r.category).toBe('work');
    expect(r.subCategory).toBe('Meeting');
    expect(r.description).toBe('Quarterly review');
  });

  // ── sub-category spelling variants ───────────────────────────────────────

  it('"subcategory" without hyphen or space', () => {
    const r = parseVoiceEntry('from 8 to 9, category self, subcategory exercise');
    expect(r.subCategory).toBe('Exercise');
  });

  it('"sub category" with space', () => {
    const r = parseVoiceEntry('from 8 to 9, category self, sub category exercise');
    expect(r.subCategory).toBe('Exercise');
  });

  // ── Time formats ──────────────────────────────────────────────────────────

  it('numeric times with am/pm', () => {
    const r = parseVoiceEntry('from 9:30 am to 11:45 pm, category work');
    expect(r.startTime).toBe('09:30');
    expect(r.endTime).toBe('23:45');
  });

  it('noon and midnight keywords', () => {
    const r = parseVoiceEntry('from noon to midnight, category self');
    expect(r.startTime).toBe('12:00');
    expect(r.endTime).toBe('00:00');
  });

  it('pm conversion', () => {
    const r = parseVoiceEntry('from 1 pm to 3 pm, category family');
    expect(r.startTime).toBe('13:00');
    expect(r.endTime).toBe('15:00');
  });

  // ── Partial / missing fields ──────────────────────────────────────────────

  it('only time — no other fields', () => {
    const r = parseVoiceEntry('from 9 am to 10 am');
    expect(r.startTime).toBe('09:00');
    expect(r.endTime).toBe('10:00');
    expect(r.category).toBeUndefined();
    expect(r.subCategory).toBeUndefined();
    expect(r.description).toBeUndefined();
  });

  it('no time — only labeled fields', () => {
    const r = parseVoiceEntry('category routine, sub-category morning walk, description 30 minutes');
    expect(r.startTime).toBeUndefined();
    expect(r.endTime).toBeUndefined();
    expect(r.category).toBe('routine');
    expect(r.subCategory).toBe('Morning walk');
    expect(r.description).toBe('30 minutes');
  });

  it('unrecognised category is ignored', () => {
    const r = parseVoiceEntry('from 9 to 10, category sports');
    expect(r.category).toBeUndefined();
  });

  it('empty string returns empty object', () => {
    expect(parseVoiceEntry('')).toEqual({});
  });
});
