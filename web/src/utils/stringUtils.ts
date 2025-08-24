
export const highlightKeywordsInText = (text: string, keywords: string[]): string => {
  if (!keywords || keywords.length === 0 || !text) return text;
  
  let highlightedText = text;
  
  keywords.forEach(keyword => {
    // Use a regex to find whole words, case-insensitively
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    highlightedText = highlightedText.replace(
      regex, 
      `<span class="keyword-highlight">${keyword}</span>`
    );
  });
  
  return highlightedText;
};

export const formatTitle = (title: string): string => {
  if (!title) return '';

  // 1. Remove trailing period
  const trimmedTitle = title.trim().replace(/\.$/, '');

  // Articles and prepositions that should be lowercase (except when first word)
  const lowercaseArticles = new Set(['the', 'of', 'to', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'by', 'for', 'with', 'from']);

  // 2. Capitalize first letter of each word, handling parentheses and articles
  const titleCased = trimmedTitle
    .split(' ')
    .map((word, index) => {
        const isFirstWord = index === 0;
        
        if (word.startsWith('(')) {
            const innerWord = word.slice(1);
            const shouldCapitalize = isFirstWord || !lowercaseArticles.has(innerWord.toLowerCase());
            return '(' + (shouldCapitalize ? 
                innerWord.charAt(0).toUpperCase() + innerWord.slice(1).toLowerCase() :
                innerWord.toLowerCase());
        }
        
        // Preserve case for Roman numerals (e.g., I, V, X)
        if (/^[IVXLC]+$/.test(word)) {
            return word.toUpperCase();
        }
        
        // First word is always capitalized, articles are lowercase unless first
        if (isFirstWord || !lowercaseArticles.has(word.toLowerCase())) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        } else {
            return word.toLowerCase();
        }
    })
    .join(' ');

    // 3. Replace leading "Of " with "To "
    if (titleCased.startsWith('Of ')) {
        return 'To ' + titleCased.slice(3);
    }

    return titleCased;
};
