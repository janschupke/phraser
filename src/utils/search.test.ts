import { describe, it, expect } from 'vitest';
import { filterTranslations } from './search';
import type { Translation } from '../types';

const rows: Translation[] = [
  { id: '1', mandarin: '你好', translation: 'Hello', pinyin: 'nǐ hǎo' },
  { id: '2', mandarin: '謝謝', translation: 'Thank you', pinyin: 'xiè xiè' },
  { id: '3', mandarin: '再見', translation: 'Goodbye, friend', pinyin: 'zài jiàn' },
];

const ids = (list: Translation[]) => list.map(t => t.id);

describe('filterTranslations', () => {
  it('returns everything for an empty or whitespace query', () => {
    expect(filterTranslations(rows, '')).toHaveLength(3);
    expect(filterTranslations(rows, '   ')).toHaveLength(3);
  });

  it('matches the english translation, case-insensitively', () => {
    expect(ids(filterTranslations(rows, 'hello'))).toEqual(['1']);
    expect(ids(filterTranslations(rows, 'HELLO'))).toEqual(['1']);
  });

  it('matches Han characters', () => {
    // Depends on the CJK normalization fix: with the old ASCII-only \w, every
    // Mandarin query matched every row.
    expect(ids(filterTranslations(rows, '你好'))).toEqual(['1']);
    expect(ids(filterTranslations(rows, '謝'))).toEqual(['2']);
  });

  it('matches pinyin regardless of tone marks', () => {
    expect(ids(filterTranslations(rows, 'ni hao'))).toEqual(['1']);
    expect(ids(filterTranslations(rows, 'zai'))).toEqual(['3']);
  });

  it('requires every term to match, in any field', () => {
    expect(ids(filterTranslations(rows, 'hello ni'))).toEqual(['1']);
    expect(filterTranslations(rows, 'hello xie')).toHaveLength(0);
  });

  it('ignores punctuation in the query', () => {
    expect(ids(filterTranslations(rows, 'goodbye,'))).toEqual(['3']);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterTranslations(rows, 'zzz')).toHaveLength(0);
  });
});
