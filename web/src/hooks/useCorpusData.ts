import { useState, useEffect } from 'react';
import { AllCorpusData, CorpusData } from '../types/corpus';
import { formatTitle } from '../utils/stringUtils';

export const useCorpusData = () => {
  const [corpusData, setCorpusData] = useState<AllCorpusData>({
    hymns: null,
    argonautica: null,
    lithica: null,
    tablets: null,
    queries: null,
    papyrusQueries: null
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
          lithicaResponse, 
          tabletsResponse, 
          queriesResponse, 
          papyrusQueriesResponse
        ] = await Promise.all([
          fetch('/corpus_20250822_121628/hymns.json'),
          fetch('/corpus_20250822_121628/argonautica.json'), 
          fetch('/corpus_20250822_121628/lithica.json'),
          fetch('/corpus_20250822_121628/tablets.json'),
          fetch('/corpus_20250822_121628/dodona_queries.json'),
          fetch('/corpus_20250822_121628/papyrus_queries.json')
        ]);

        console.log('Responses received:', 
          hymnsResponse.status, 
          argonauticaResponse.status, 
          lithicaResponse.status, 
          tabletsResponse.status, 
          queriesResponse.status, 
          papyrusQueriesResponse.status
        );

        const [
          hymnsData, 
          argonauticaData, 
          lithicaData, 
          tabletsData, 
          queriesData, 
          papyrusQueriesData
        ] = await Promise.all([
          hymnsResponse.json(),
          argonauticaResponse.json(),
          lithicaResponse.json(),
          tabletsResponse.json(),
          queriesResponse.json(),
          papyrusQueriesResponse.json()
        ]);

        console.log('Raw data loaded:', {
          hymns: hymnsData.parts?.length || 0,
          argonautica: argonauticaData.parts?.length || 0,
          lithica: lithicaData.parts?.length || 0,
          tablets: tabletsData.parts?.length || 0,
          queries: queriesData.parts?.length || 0,
          papyrusQueries: papyrusQueriesData.parts?.length || 0
        });

        const processCorpusData = (data: any): CorpusData => ({
          metadata: data.metadata,
          parts: data.parts.map((part: any) => ({
            ...part,
            key: part.part_number,
            title_english: formatTitle(part.part_title)
          }))
        });

        const processedData: AllCorpusData = {
          hymns: processCorpusData(hymnsData),
          argonautica: processCorpusData(argonauticaData),
          lithica: processCorpusData(lithicaData),
          tablets: {
            metadata: tabletsData.metadata,
            parts: tabletsData.parts.map((part: any) => ({
              ...part,
              key: part.tablet_id || `tablet${part.part_number}`,
              title_english: part.part_title
            }))
          },
          queries: {
            metadata: queriesData.metadata,
            parts: queriesData.parts.map((part: any) => ({
              ...part,
              key: part.query_id || `query${part.part_number}`,
              title_english: part.part_title
            }))
          },
          papyrusQueries: {
            metadata: papyrusQueriesData.metadata,
            parts: papyrusQueriesData.parts.map((part: any) => ({
              ...part,
              key: part.query_id || `query${part.part_number}`,
              title_english: part.part_title
            }))
          }
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