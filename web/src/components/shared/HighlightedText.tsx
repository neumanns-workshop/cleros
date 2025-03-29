import React, { useMemo, useCallback } from 'react';
import { useDeityContext } from '../../context/DeityContext';
import { EntityClassification, getCategoryColorClass } from '../../services/deities';

interface HighlightedTextProps {
  text: string;
  hymnId: string;
  lineNum: number;
  className?: string;
}

interface TextSegment {
  type: 'text';
  text: string;
}

interface EntitySegment {
  type: 'entity';
  text: string;
  entity: EntityClassification;
}

type Segment = TextSegment | EntitySegment;

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  hymnId,
  lineNum,
  className = '',
}) => {
  const { classifications } = useDeityContext();
  
  // Get all entities from the classifications
  const allEntities = useMemo(() => {
    return classifications.map(entity => ({
      name: entity.entity,
      category: entity.category,
      hymn_id: entity.hymn_id,
      line_num: entity.line_num
    }));
  }, [classifications]);
  
  // Helper function to check if a character is an alpha character
  const isAlpha = useCallback((char: string): boolean => {
    return /[a-zA-Z]/.test(char);
  }, []);
  
  // Helper function to check if a string is numeric
  const isNumeric = useCallback((str: string): boolean => {
    return /^\d+$/.test(str);
  }, []);
  
  // Helper function to check if a string has valid entity characteristics
  const isValidEntityName = useCallback((name: string): boolean => {
    // Filter out purely numeric values
    if (isNumeric(name)) return false;
    
    // Filter out strings that are just numbers with some letters
    if (/^\d+[a-z]*$/.test(name.toLowerCase())) return false;
    
    // Filter out common numeric words
    const numericWords = [
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
      'once', 'twice', 'thrice', 'hundred', 'thousand'
    ];
    
    if (numericWords.includes(name.toLowerCase())) return false;
    
    return true;
  }, [isNumeric]);
  
  // Create an array of text segments with highlights based on entity names
  const segments = useMemo(() => {
    // First, collect all entity occurrences in the text
    const entityPositions: {
      startPos: number;
      endPos: number;
      entity: string;
      category: string;
    }[] = [];
    
    // For each entity name in our dataset
    allEntities.forEach(({ name, category }) => {
      // Apply linguistic filters
      if (!isValidEntityName(name)) return;
      
      let startPos = 0;
      
      // Find all occurrences of the entity name in the text
      while (startPos <= text.length - name.length) {
        const position = text.indexOf(name, startPos);
        if (position === -1) break;
        
        // Make sure we have a word boundary or punctuation
        const isValidStart = position === 0 || !isAlpha(text[position-1]);
        const isValidEnd = position + name.length === text.length || !isAlpha(text[position + name.length]);
        
        if (isValidStart && isValidEnd) {
          entityPositions.push({
            startPos: position,
            endPos: position + name.length,
            entity: name,
            category
          });
        }
        
        // Continue searching from the next position
        startPos = position + 1;
      }
    });
    
    // If no entities found, return just the text
    if (entityPositions.length === 0) {
      return [{ type: 'text', text } as TextSegment];
    }
    
    // Sort positions by start position to process them in order
    entityPositions.sort((a, b) => a.startPos - b.startPos);
    
    // Handle overlaps by keeping the longer entity names
    const finalPositions: typeof entityPositions = [];
    for (const pos of entityPositions) {
      // Check if this position overlaps with any already processed position
      const overlapIndex = finalPositions.findIndex(
        existing => 
          (pos.startPos >= existing.startPos && pos.startPos < existing.endPos) ||
          (pos.endPos > existing.startPos && pos.endPos <= existing.endPos) ||
          (pos.startPos <= existing.startPos && pos.endPos >= existing.endPos)
      );
      
      if (overlapIndex === -1) {
        // No overlap, add this position
        finalPositions.push(pos);
      } else {
        // There's an overlap, keep the longer entity name
        const existing = finalPositions[overlapIndex];
        const existingLength = existing.endPos - existing.startPos;
        const newLength = pos.endPos - pos.startPos;
        
        if (newLength > existingLength) {
          // Replace the existing one with this one
          finalPositions[overlapIndex] = pos;
        }
      }
    }
    
    // Now create text segments from these positions
    const result: Segment[] = [];
    let lastIndex = 0;
    
    // Sort final positions again since we may have replaced some
    finalPositions.sort((a, b) => a.startPos - b.startPos);
    
    for (const pos of finalPositions) {
      // Add text before the entity
      if (pos.startPos > lastIndex) {
        result.push({
          type: 'text',
          text: text.substring(lastIndex, pos.startPos)
        });
      }
      
      // Add the entity
      result.push({
        type: 'entity',
        text: text.substring(pos.startPos, pos.endPos),
        entity: {
          entity: pos.entity,
          category: pos.category,
          hymn_id: hymnId,
          line_num: lineNum.toString(),
          start_char: pos.startPos,
          end_char: pos.endPos
        }
      });
      
      lastIndex = pos.endPos;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        text: text.substring(lastIndex)
      });
    }
    
    return result;
  }, [allEntities, text, hymnId, lineNum, isAlpha, isValidEntityName]);
  
  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <React.Fragment key={index}>{segment.text}</React.Fragment>;
        } else {
          const colorClass = getCategoryColorClass(segment.entity.category);
          return (
            <span
              key={index}
              className={`deity-highlight ${colorClass}`}
              title={`${segment.entity.category}`}
            >
              {segment.text}
            </span>
          );
        }
      })}
    </span>
  );
}; 