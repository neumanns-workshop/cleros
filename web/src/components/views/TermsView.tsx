import React from 'react';
import { ViewType } from '../../types/app';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

interface TermsViewProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const TermsView: React.FC<TermsViewProps> = ({
  currentView,
  setCurrentView
}) => {
  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="about-view">
        <div style={{ backgroundColor: '#242830', border: '1px solid #a8a8a833', borderRadius: '8px', padding: '2rem' }}>
          <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '2rem' }}>Terms of Service</h2>
          
          <div style={{ color: '#f5f4f0', lineHeight: '1.6' }}>
            <div style={{ fontSize: '0.9rem', color: '#a8a8a8', marginBottom: '1.5rem' }}>
              <p style={{ marginBottom: '0.25rem' }}><strong>Effective Date: January 15, 2025</strong></p>
              <p style={{ marginBottom: '0.25rem' }}><strong>Last Updated: February 18, 2026</strong></p>
            </div>
            
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h3>
              <p style={{ marginBottom: '1rem' }}>
                By accessing or using Cleros ("the Service"), an ancient oracle consultation platform operated by Galaxy Brain Entertainment 
                ("Company", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these 
                Terms, do not use the Service.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>2. Description of Service</h3>
              <p style={{ marginBottom: '1rem' }}>Cleros is an interactive ancient oracle consultation platform that provides spiritual guidance through ancient Greek texts. The Service includes:</p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Oracle consultations using authentic ancient Greek religious texts</li>
                <li style={{ marginBottom: '0.5rem' }}>Access to the Orphic corpus (Hymns, Argonautica, Lithica)</li>
                <li style={{ marginBottom: '0.5rem' }}>Historical and educational content about ancient Greek oracular practices</li>
                <li style={{ marginBottom: '0.5rem' }}>Semantic search and text exploration tools</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>3. Educational and Entertainment Purpose</h3>
              <p style={{ marginBottom: '1rem' }}><strong>Important Disclaimer:</strong></p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Cleros is provided for educational, historical, and entertainment purposes only.</li>
                <li style={{ marginBottom: '0.5rem' }}>The oracle responses are generated from historical texts and should not be considered as professional advice.</li>
                <li style={{ marginBottom: '0.5rem' }}>We make no claims about the accuracy, completeness, or reliability of any oracle responses.</li>
                <li style={{ marginBottom: '0.5rem' }}>Users should not rely on oracle consultations for important life decisions.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>4. Data and Privacy</h3>
              <p style={{ marginBottom: '1rem' }}><strong>Local Data Storage:</strong></p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>All consultation history and preferences are stored locally on your device.</li>
                <li style={{ marginBottom: '0.5rem' }}>We do not collect or store any personal data on our servers.</li>
              </ul>
              <p style={{ marginBottom: '1rem' }}><strong>Data Control:</strong></p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>You can clear your browser cache at any time to reset your consultation history.</li>
                <li style={{ marginBottom: '0.5rem' }}>Deleting the app will permanently remove all of your data.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>5. Limitations of Liability</h3>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>The Service is provided "as is" without warranties of any kind.</li>
                <li style={{ marginBottom: '0.5rem' }}>We are not liable for any decisions made based on oracle consultations.</li>
                <li style={{ marginBottom: '0.5rem' }}>We are not responsible for any spiritual, emotional, or other consequences of using the Service.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>6. Contact Information</h3>
              <p style={{ marginBottom: '1rem' }}>For questions about these Terms or the Service:</p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Support: <a href="mailto:social@gbe.games" style={{ color: '#d4af37', textDecoration: 'underline' }}>social@gbe.games</a></li>
                <li style={{ marginBottom: '0.5rem' }}>Website: <a href="https://cleros.gbe.games" style={{ color: '#d4af37', textDecoration: 'underline' }}>cleros.gbe.games</a></li>
              </ul>
            </section>

            <div style={{ borderTop: '1px solid #a8a8a833', paddingTop: '1rem', marginTop: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#a8a8a8', fontStyle: 'italic' }}>
                These Terms of Service are designed to protect both users and the service while maintaining respect for the ancient spiritual traditions represented in our texts.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
};
