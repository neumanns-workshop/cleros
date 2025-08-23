import { SearchMode } from '../../types/app';

interface ModeSwitcherProps {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  isRandomOrgAvailable: boolean | null;
}

export const ModeSwitcher = ({ searchMode, setSearchMode, isRandomOrgAvailable }: ModeSwitcherProps) => (
  <div className="mode-switcher">
    <button 
      className={`mode-button ${searchMode === 'oracle' ? 'active' : ''}`}
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
      className={`mode-button ${searchMode === 'sage' ? 'active' : ''}`}
      onClick={() => setSearchMode('sage')}
    >
      Counsel
    </button>
  </div>
);