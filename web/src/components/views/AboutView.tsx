 import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { ViewType } from '../../types/app';

interface AboutViewProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const AboutView = ({ currentView, setCurrentView }: AboutViewProps) => (
  <div className="app">
    <Header currentView={currentView} setCurrentView={setCurrentView} />
    
    <div className="about-view">
      <h2>About Cleros</h2>
      
      <section className="about-section">
        <h3>Digital Bibliomancy</h3>
        <p>
          Cleros is a digital bibliomancy application that uses computational methods to consult ancient texts. 
          Where Greeks and Romans sought guidance in Homer&rsquo;s <em>Iliad</em> and Virgil&rsquo;s <em>Aeneid</em>, this application 
          draws upon Orphic literature: the <em>Hymni</em>, <em>Argonautica</em>, and <em>Lithica</em>.
        </p>
        <p>
          Each text appears in parallel Greek-English translation with AI commentary. While no historical bibliomantic 
          tradition for Orphic texts is attested, their thematic focus on death, rebirth, and spiritual transformation 
          makes them relevant for this application.
        </p>
      </section>

      <section className="about-section">
        <h3>Etymology</h3>
        <p>
          The name &ldquo;Cleros&rdquo; derives from κλῆρος (klēros), the Greek word meaning &ldquo;lot&rdquo; or &ldquo;allotted portion&rdquo;—
          the share of fate assigned to each person. Beyond simple chance, κλῆρος was the mechanism through 
          which divine will was thought to manifest in human affairs.
        </p>
      </section>

      <section className="about-section">
        <h3>Two Methods</h3>
        
        <div className="mode-description">
          <h4>Oracle Mode</h4>
          <p>
            Oracle mode provides responses through random selection. The system uses the Web Crypto API as a source of
            cryptographic entropy to select passages. The selection process is purely random with no semantic analysis or text matching.
          </p>
          <p>
            This method follows the classical tradition of sortes (lot-casting) used in ancient divination practices.
          </p>
        </div>

        <div className="mode-description">
          <h4>Counsel Mode</h4>
          <p>
            Counsel mode uses semantic search to find the most relevant passages for your question. Algorithms analyze 
            the corpus for content similarity, returning passages ranked by relevance. No randomness—only computational 
            matching of your query to text content.
          </p>
          <p>
            This treats the texts as a searchable database, using computational methods to surface relevant content.
          </p>
        </div>
      </section>

      <section className="about-section">
        <h3>The Corpus</h3>
        
        <div className="corpus-description">
          <div className="corpus-text">
            <h4>Orphic Hymns</h4>
            <p>
              Eighty-seven invocations to deities and cosmic forces, likely used in mystery initiations. Each hymn 
              addresses its subject through epithets and requests for blessings, representing Orphic theological concepts 
              in liturgical form. The hymns include prescriptions for specific incenses to burn during each invocation.
            </p>
          </div>

          <div className="corpus-text">
            <h4>Orphic Argonautica</h4>
            <p>
              An epic poem recounting Jason&rsquo;s quest for the Golden Fleece from Orpheus&rsquo;s perspective. The text combines 
              adventure narrative with Orphic theology, presenting the hero&rsquo;s journey as spiritual allegory.
            </p>
          </div>

          <div className="corpus-text">
            <h4>Orphic Lithica</h4>
            <p>
              A treatise on the properties of stones and gems, describing their supposed powers for healing, protection, 
              and spiritual effects. The text bridges material and metaphysical concerns through detailed descriptions 
              of various minerals.
            </p>
          </div>

        </div>
      </section>

      <section className="about-section">
        <h3>Response Structure</h3>
        <p>
          Each consultation returns three passages—one from each primary Orphic text—providing different perspectives on your question.
        </p>
      </section>

      <section className="about-section">
        <h3>Technical Implementation</h3>
        <div className="tech-details">
          <h4>Frontend</h4>
          <p>
            Built with React 18 and TypeScript, hosted on Cloudflare Pages.
            Responsive design using Tailwind CSS with custom theming.
          </p>

          <h4>Randomness</h4>
          <p>
            Oracle mode uses the Web Crypto API (crypto.getRandomValues) for cryptographically secure
            random number generation, ensuring unpredictable lot-casting that cannot be reproduced or gamed.
          </p>
          
          <h4>Semantic Search</h4>
          <p>
            Counsel mode employs the all-MiniLM-L6-v2 transformer model (384-dimensional embeddings) 
            running client-side via WebAssembly. Text similarity computed through cosine distance in embedding space.
            Query keywords are expanded using WordNet via the wordpos library, with fallback to curated synonyms.
          </p>
          
          <h4>Text Processing</h4>
          <p>
            English translations and commentary generated by GPT-5 reasoning system from original Greek sources.
            Parallel text alignment maintained at sentence and line level for precise reference.
          </p>
        </div>
      </section>

      <section className="about-section">
        <h3>Important Disclaimer</h3>
        <p>
          <strong>All English translations and commentary in this application are AI-generated and may contain inaccuracies.</strong> 
          While efforts have been made to ensure quality, users should consult the original Greek sources and scholarly 
          references listed below for authoritative information.
        </p>
        <p>
          This tool is intended for educational and research purposes. For academic research or serious textual study, 
          please refer to established scholarly editions and commentaries of these ancient texts.
        </p>
      </section>

      <section className="about-section">
        <h3>Sources</h3>
        <div className="bibliography">
          <h4>Greek Source Texts</h4>
          <ul>
            <li><strong>Orphic Hymns</strong> (2nd-3rd century CE): Greek text from Thomas Taylor, <em>The Mystical Hymns of Orpheus</em> (London, 1787)</li>
            <li><strong>Orphic Argonautica</strong> (4th century CE): Greek text from Hermann Abel, <em>Orphica</em> (Leipzig: Teubner, 1885)</li>
            <li><strong>Orphic Lithica</strong> (4th-6th century CE): Greek text from Hermann Abel, <em>Orphica</em> (Leipzig: Teubner, 1885)</li>
                        </ul>
              
              <h4>Further Reading</h4>
              <ul>
                <li>Athanassakis, Apostolos N. & Benjamin M. Wolkow. <em>The Orphic Hymns</em>. Baltimore: Johns Hopkins University Press, 2013.</li>
                <li>Bernabé, Alberto. <em>Poetae Epici Graeci: Testimonia et Fragmenta</em>. Berlin: De Gruyter, 2004-2007.</li>
                <li>Edmonds, Radcliffe G. <em>Redefining Ancient Orphism: A Study in Greek Religion</em>. Cambridge: Cambridge University Press, 2013.</li>
                <li>Johnston, Sarah Iles. <em>Ancient Greek Divination</em>. Chichester: Wiley-Blackwell, 2008.</li>
                <li>Johnston, Sarah Iles. <em>Restless Dead: Encounters Between the Living and the Dead in Ancient Greece</em>. Berkeley: University of California Press, 1999.</li>
                <li>Morand, Anne-France. <em>Études sur les Hymnes Orphiques</em>. Leiden: Brill, 2001.</li>
                <li>Parker, Robert. <em>On Greek Religion</em>. Ithaca: Cornell University Press, 2011.</li>
                <li>West, M.L. <em>The Orphic Poems</em>. Oxford: Oxford University Press, 1983.</li>
              </ul>
              <p><em>Note: English translations generated by GPT-5 reasoning system from original Greek texts.</em></p>
            </div>
          </section>

      <section className="about-section">
        <h3>Contact</h3>
        <p>
          For questions, feedback, or collaboration inquiries, contact us at{' '}
          <a href="mailto:contact@gbe.games" style={{ color: '#d4af37', textDecoration: 'underline' }}>
            contact@gbe.games
          </a>
        </p>
      </section>
    </div>
    
    <Footer setCurrentView={setCurrentView} />
  </div>
);