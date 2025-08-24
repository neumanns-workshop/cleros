import { ViewType } from '../../types/app';

interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const Header = ({ currentView, setCurrentView }: HeaderProps) => (
  <header className="main-header">
    <div className="header-left">
      <img src="/orphic-egg.png" alt="Orphic Egg" className="logo" />
      <h1 className="title" onClick={() => setCurrentView('home')}>CLEROS | Digital Bibliomancy</h1>
    </div>
    <nav className="header-nav">
      <button onClick={() => setCurrentView('home')} className={`nav-button ${currentView === 'home' ? 'active' : ''}`}>Home</button>
      <button onClick={() => setCurrentView('corpus')} className={`nav-button ${currentView === 'corpus' ? 'active' : ''}`}>Corpus</button>
      <button onClick={() => setCurrentView('about')} className={`nav-button ${currentView === 'about' ? 'active' : ''}`}>About</button>
    </nav>
  </header>
);