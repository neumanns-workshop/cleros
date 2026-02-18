import React from 'react';
import { ViewType } from '../../types/app';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

interface PrivacyViewProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({
  currentView,
  setCurrentView
}) => {
  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="about-view">
        <div style={{ backgroundColor: '#242830', border: '1px solid #a8a8a833', borderRadius: '8px', padding: '2rem' }}>
          <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '2rem' }}>Privacy Policy</h2>
          
          <div style={{ color: '#f5f4f0', lineHeight: '1.6' }}>
            <p style={{ fontSize: '0.9rem', color: '#a8a8a8', marginBottom: '1.5rem' }}><strong>Last updated: February 18, 2026</strong></p>
            
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>Introduction</h3>
              <p style={{ marginBottom: '1rem' }}>
                Cleros ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                ancient oracle consultation platform.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>Information We Collect</h3>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Consultation Records:</strong> Your oracle queries and responses are stored locally on your device to provide historical access to your consultations.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Preferences:</strong> Your selected mode (modern/ancient) and theme preferences are stored locally.</li>
                <li style={{ marginBottom: '0.5rem' }}>We do not collect any personally identifiable information.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>How We Use Your Information</h3>
              <p style={{ marginBottom: '1rem' }}>
                We do not collect or use any of your personal information. All consultation data and preferences are stored 
                locally on your device and are not transmitted to our servers.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>Data Sharing</h3>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>We do not share, sell, or transmit any of your data to third parties.</li>
                <li style={{ marginBottom: '0.5rem' }}>All oracle consultations remain private and local to your device.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>Your Rights & Controls</h3>
              <p style={{ marginBottom: '1rem' }}>You have full control over your data:</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Data Management:</strong></p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>You can clear your browser cache to reset all of your consultation history at any time.</li>
                <li style={{ marginBottom: '0.5rem' }}>Deleting the application from your device will permanently remove all associated data.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem' }}>Contact Us</h3>
              <p style={{ marginBottom: '1rem' }}>If you have questions about this Privacy Policy, please contact us at:</p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Email: <a href="mailto:social@gbe.games" style={{ color: '#d4af37', textDecoration: 'underline' }}>social@gbe.games</a></li>
                <li style={{ marginBottom: '0.5rem' }}>Website: <a href="https://cleros.gbe.games" style={{ color: '#d4af37', textDecoration: 'underline' }}>cleros.gbe.games</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
};
