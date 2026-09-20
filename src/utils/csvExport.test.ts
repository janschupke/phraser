import { describe, it, expect, vi, afterEach } from 'vitest';
import { exportTranslationsToCSV, downloadTranslationsAsCSV } from './csvExport';
import type { Translation } from '../types';
import { at } from '../test/helpers';

const make = (mandarin: string, translation: string, pinyin = ''): Translation => ({
  id: mandarin,
  mandarin,
  translation,
  pinyin,
  correctCount: 0,
  incorrectCount: 0,
});

const HEADER = 'mandarin,translation,pinyin';

describe('csvExport', () => {
  describe('exportTranslationsToCSV', () => {
    it('exports an empty list as the header row only', () => {
      expect(exportTranslationsToCSV([])).toBe(HEADER);
    });

    it('exports one row per translation', () => {
      const csv = exportTranslationsToCSV([
        make('你好', 'Hello', 'nǐ hǎo'),
        make('謝謝', 'Thank you', 'xiè xiè'),
      ]);
      const lines = csv.split('\n');

      expect(at(lines, 0)).toBe(HEADER);
      expect(at(lines, 1)).toBe('你好,Hello,nǐ hǎo');
      expect(at(lines, 2)).toBe('謝謝,Thank you,xiè xiè');
    });

    it('quotes fields containing a comma', () => {
      const csv = exportTranslationsToCSV([make('你好', 'Hello, world')]);
      expect(at(csv.split('\n'), 1)).toBe('你好,"Hello, world",');
    });

    it('does not quote a full-width comma, which needs no escaping', () => {
      const csv = exportTranslationsToCSV([make('你好，世界', 'Hello')]);
      expect(at(csv.split('\n'), 1)).toBe('你好，世界,Hello,');
    });

    it('doubles embedded quotes and wraps the field', () => {
      const csv = exportTranslationsToCSV([make('他說"你好"', 'He said "hello"')]);
      expect(at(csv.split('\n'), 1)).toBe('"他說""你好""","He said ""hello""",');
    });

    it('quotes fields containing a newline', () => {
      const csv = exportTranslationsToCSV([make('你好', 'Hello\nthere')]);
      expect(csv).toContain('"Hello\nthere"');
    });

    it('writes an empty pinyin column when pinyin is absent', () => {
      const csv = exportTranslationsToCSV([{ id: '1', mandarin: '你好', translation: 'Hello' }]);
      expect(at(csv.split('\n'), 1)).toBe('你好,Hello,');
    });
  });

  describe('downloadTranslationsAsCSV', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('builds a dated filename, clicks the link, and revokes the object URL', () => {
      const createObjectURL = vi.fn(() => 'blob:fake');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

      const click = vi.fn();
      const appendChild = vi.spyOn(document.body, 'appendChild');
      const removeChild = vi.spyOn(document.body, 'removeChild');
      const anchor = document.createElement('a');
      anchor.click = click;
      vi.spyOn(document, 'createElement').mockReturnValue(anchor);

      downloadTranslationsAsCSV([make('你好', 'Hello')]);

      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(anchor.getAttribute('href')).toBe('blob:fake');
      expect(anchor.getAttribute('download')).toMatch(
        /^phraser-translations-\d{4}-\d{2}-\d{2}\.csv$/
      );
      expect(click).toHaveBeenCalledOnce();
      expect(appendChild).toHaveBeenCalledWith(anchor);
      expect(removeChild).toHaveBeenCalledWith(anchor);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake');
    });
  });
});
