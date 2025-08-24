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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
          <h1 className="text-3xl font-bold mb-6 text-center">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>Effective Date: January 15, 2025</strong></p>
              <p><strong>Last Updated: January 15, 2025</strong></p>
            </div>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Cleros ("the Service"), an ancient oracle consultation platform operated by Galaxy Brain Entertainment 
                ("Company", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these 
                Terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p>Cleros is an interactive ancient oracle consultation platform that provides spiritual guidance through ancient Greek texts. The Service includes:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Oracle consultations using authentic ancient Greek religious texts</li>
                <li>Access to the Orphic corpus, Dodona oracle queries, and papyrus oracle records</li>
                <li>Historical and educational content about ancient Greek oracular practices</li>
                <li>Semantic search and text exploration tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Educational and Entertainment Purpose</h2>
              <p><strong>Important Disclaimer:</strong></p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Cleros is provided for educational, historical, and entertainment purposes only.</li>
                <li>The oracle responses are generated from historical texts and should not be considered as professional advice.</li>
                <li>We make no claims about the accuracy, completeness, or reliability of any oracle responses.</li>
                <li>Users should not rely on oracle consultations for important life decisions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data and Privacy</h2>
              <p><strong>Local Data Storage:</strong></p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>All consultation history and preferences are stored locally on your device.</li>
                <li>We do not collect or store any personal data on our servers.</li>
              </ul>
              <p className="mt-3"><strong>Data Control:</strong></p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>You can clear your browser cache at any time to reset your consultation history.</li>
                <li>Deleting the app will permanently remove all of your data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Limitations of Liability</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>The Service is provided "as is" without warranties of any kind.</li>
                <li>We are not liable for any decisions made based on oracle consultations.</li>
                <li>We are not responsible for any spiritual, emotional, or other consequences of using the Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Contact Information</h2>
              <p>For questions about these Terms or the Service:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Support: social@gbe.games</li>
                <li>Website: cleros.gbe.games</li>
              </ul>
            </section>

            <div className="border-t border-purple-500/30 pt-4 mt-8">
              <p className="text-sm text-gray-400 italic">
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
