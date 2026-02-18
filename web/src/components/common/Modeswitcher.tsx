import { SearchMode } from '../../types/app';

interface ModeSwitcherProps {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  isEmbeddingsAvailable: boolean | null;
}

export const ModeSwitcher = ({ searchMode, setSearchMode, isEmbeddingsAvailable }: ModeSwitcherProps) => (
  <div className="mode-switcher">
    <button
      className={`mode-button ${searchMode === 'oracle' ? 'active' : ''}`}
      title="Random selection using cryptographically secure hardware entropy"
      onClick={() => setSearchMode('oracle')}
    >
      Oracle
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
