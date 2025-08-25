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
      title="Random selection using atmospheric noise"
      onClick={() => {
        if (isRandomOrgAvailable === false) {
          alert('Oracle mode requires true randomness from random.org for principled divination.');
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
      title="Semantic search for relevant passages"
      onClick={() => {
        if (!isEmbeddingsAvailable) {
          alert('Counsel mode requires embedding models which are not available. Please try again later.');
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