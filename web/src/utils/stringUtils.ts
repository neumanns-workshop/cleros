
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

  // 2. Capitalize first letter of each word, handling parentheses
  const titleCased = trimmedTitle
    .split(' ')
    .map(word => {
        if (word.startsWith('(')) {
            return '(' + word.charAt(1).toUpperCase() + word.slice(2).toLowerCase();
        }
        // Preserve case for Roman numerals (e.g., I, V, X)
        if (/^[IVXLC]+$/.test(word)) {
            return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

    // 3. Replace leading "Of " with "To "
    if (titleCased.startsWith('Of ')) {
        return 'To ' + titleCased.slice(3);
    }

    return titleCased;
};
