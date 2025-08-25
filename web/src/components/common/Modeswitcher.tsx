import { SearchMode } from '../../types/app';

interface ModeSwitcherProps {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  isRandomOrgAvailable: boolean | null;
  isEmbeddingsAvailable: boolean | null;
}

export const ModeSwitcher = ({ searchMode, setSearchMode, isRandomOrgAvailable, isEmbeddingsAvailable }: ModeSwitcherProps) => (
  <div className="mode-switcher">
    <button 
      className={`mode-button ${searchMode === 'oracle' ? 'active' : ''}`}
      title={isRandomOrgAvailable === false 
        ? 'Oracle mode disabled: Requires true randomness from random.org for principled divination'
        : 'Random selection using atmospheric noise from random.org'
      }
      onClick={() => {
        if (isRandomOrgAvailable === false) {
          return;
        }
        setSearchMode('oracle');
      }}
      disabled={isRandomOrgAvailable === false}
      style={{ 
        opacity: isRandomOrgAvailable === false ? 0.5 : 1,
        cursor: isRandomOrgAvailable === false ? 'not-allowed' : 'pointer'
      }}
    >
      Oracle {isRandomOrgAvailable === false && '(Disabled)'}
    </button>
    <button 
      className={`mode-button ${searchMode === 'counsel' ? 'active' : ''}`}
      title={!isEmbeddingsAvailable 
        ? 'Counsel mode disabled: Embedding models are loading or unavailable. Please wait or try again later.'
        : 'Semantic search for relevant passages using AI embeddings'
      }
      onClick={() => {
        if (!isEmbeddingsAvailable) {
          return;
        }
        setSearchMode('counsel');
      }}
      disabled={!isEmbeddingsAvailable}
      style={{ 
        opacity: !isEmbeddingsAvailable ? 0.5 : 1,
        cursor: !isEmbeddingsAvailable ? 'not-allowed' : 'pointer'
      }}
    >
      Counsel {!isEmbeddingsAvailable && '(Disabled)'}
    </button>
  </div>
);