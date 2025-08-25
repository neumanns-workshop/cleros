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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
          <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-sm text-gray-100"><strong>Last updated: January 15, 2025</strong></p>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Introduction</h2>
              <p>
                Cleros ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                ancient oracle consultation platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Consultation Records:</strong> Your oracle queries and responses are stored locally on your device to provide historical access to your consultations.</li>
                <li><strong>Preferences:</strong> Your selected mode (modern/ancient) and theme preferences are stored locally.</li>
                <li>We do not collect any personally identifiable information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
              <p>
                We do not collect or use any of your personal information. All consultation data and preferences are stored 
                locally on your device and are not transmitted to our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We do not share, sell, or transmit any of your data to third parties.</li>
                <li>All oracle consultations remain private and local to your device.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Your Rights & Controls</h2>
              <p>You have full control over your data:</p>
              <p><strong>Data Management:</strong></p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>You can clear your browser cache to reset all of your consultation history at any time.</li>
                <li>Deleting the application from your device will permanently remove all associated data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Email: social@gbe.games</li>
                <li>Website: cleros.gbe.games</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
};
