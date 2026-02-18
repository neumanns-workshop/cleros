import { useState, useEffect } from 'react';
import { AllCorpusData, CorpusData, CorpusPart } from '../types/corpus';
import { formatTitle } from '../utils/stringUtils';

// Interface for raw JSON data from the API
interface RawCorpusData {
  metadata: {
    name: string;
    title: string;
    description?: string;
    total_parts?: number;
    total_lines?: number;
  };
  parts: Array<{
    part_number: number;
    part_title: string;
    key?: string | number;
    incense?: string;
    lines?: Array<{
      line: number;
      english: string;
      greek?: string;
      note?: string;
    }>;
    sentences?: Array<{
      sentence_id: string;
      text: {
        english: string;
        greek?: string;
      };
      line_details: Array<{
        line: number;
        english: string;
        greek?: string;
        note?: string;
      }>;
    }>;
  }>;
}

export const useCorpusData = () => {
  const [corpusData, setCorpusData] = useState<AllCorpusData>({
    hymns: null,
    argonautica: null,
    lithica: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllCorpusData = async () => {
      try {
        console.log('Loading corpus data...');
        const [
          hymnsResponse,
          argonauticaResponse,
          lithicaResponse
        ] = await Promise.all([
          fetch('/corpus_20250822_121628/hymns.json'),
          fetch('/corpus_20250822_121628/argonautica.json'),
          fetch('/corpus_20250822_121628/lithica.json')
        ]);

        console.log('Responses received:',
          hymnsResponse.status,
          argonauticaResponse.status,
          lithicaResponse.status
        );

        const [
          hymnsData,
          argonauticaData,
          lithicaData
        ] = await Promise.all([
          hymnsResponse.json(),
          argonauticaResponse.json(),
          lithicaResponse.json()
        ]);

        console.log('Raw data loaded:', {
          hymns: hymnsData.parts?.length || 0,
          argonautica: argonauticaData.parts?.length || 0,
          lithica: lithicaData.parts?.length || 0
        });

        const processCorpusData = (data: RawCorpusData): CorpusData => ({
          metadata: data.metadata,
          parts: data.parts.map((part): CorpusPart => ({
            ...part,
            key: part.part_number,
            title_english: formatTitle(part.part_title)
          }))
        });

        const processedData: AllCorpusData = {
          hymns: processCorpusData(hymnsData),
          argonautica: processCorpusData(argonauticaData),
          lithica: processCorpusData(lithicaData)
        };

        console.log('Processed data:', processedData);
        setCorpusData(processedData);
        console.log('✅ Corpus data loaded and processed successfully.');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load corpus data';
        console.error('Failed to load corpus data:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAllCorpusData();
  }, []);

  return { corpusData, loading, error };
};