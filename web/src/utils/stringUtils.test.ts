import { describe, it, expect } from 'vitest';
import { formatTitle, highlightKeywordsInText } from './stringUtils';

describe('stringUtils', () => {
  describe('formatTitle', () => {
    it('should capitalize first letter of each word', () => {
      expect(formatTitle('test title')).toBe('Test Title');
      expect(formatTitle('the great work')).toBe('The Great Work');
    });

    it('should handle articles and prepositions correctly', () => {
      expect(formatTitle('the book of shadows')).toBe('The Book of Shadows');
      expect(formatTitle('a song to the gods')).toBe('A Song to the Gods');
    });

    it('should remove trailing periods', () => {
      expect(formatTitle('Ancient Wisdom.')).toBe('Ancient Wisdom');
    });

    it('should handle Roman numerals', () => {
      expect(formatTitle('chapter V of the book')).toBe('Chapter V of the Book');
      expect(formatTitle('hymn III to apollo')).toBe('Hymn III to Apollo');
    });

    it('should convert "Of" to "To" at the beginning', () => {
      expect(formatTitle('Of ancient wisdom')).toBe('To Ancient Wisdom');
    });

    it('should handle parentheses correctly', () => {
      expect(formatTitle('(the ancient text)')).toBe('(The Ancient Text)');
    });

    it('should handle empty/null input', () => {
      expect(formatTitle('')).toBe('');
      expect(formatTitle(null as any)).toBe('');
      expect(formatTitle(undefined as any)).toBe('');
    });
  });

  describe('highlightKeywordsInText', () => {
    it('should highlight keywords in text', () => {
      const result = highlightKeywordsInText('The ancient wisdom', ['wisdom']);
      expect(result).toBe('The ancient <span class="keyword-highlight">wisdom</span>');
    });

    it('should handle multiple keywords', () => {
      const result = highlightKeywordsInText('The ancient wisdom and knowledge', ['ancient', 'wisdom']);
      expect(result).toContain('<span class="keyword-highlight">ancient</span>');
      expect(result).toContain('<span class="keyword-highlight">wisdom</span>');
    });

    it('should handle empty keywords array', () => {
      expect(highlightKeywordsInText('test text', [])).toBe('test text');
    });

    it('should handle empty text', () => {
      expect(highlightKeywordsInText('', ['keyword'])).toBe('');
    });
  });
});
