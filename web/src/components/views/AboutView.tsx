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
          Each text appears in parallel Greek-English translation with AI commentary. Though no historical bibliomantic 
          tradition for Orphic texts has survived, their focus on death, rebirth, and spiritual transformation makes them 
          suitable for consultation. The collection includes Orphic Golden Tablets and oracle queries from Dodona.
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
            Oracle mode provides responses through lot-casting. Your query triggers true randomness powered by atmospheric noise, 
            selecting passages that are then highlighted for keyword matches and semantic similarity to your question.
          </p>
          <p>
            This follows the tradition that meaningful coincidence can emerge from random selection.
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

          <div className="corpus-text">
            <h4>Golden Tablets</h4>
            <p>
              Funeral texts inscribed on gold sheets and buried with initiates, containing instructions for the afterlife journey. 
              These artifacts preserve ritual passwords and declarations, providing insight into mystery religion practices.
            </p>
          </div>

          <div className="corpus-text">
            <h4>Oracle Queries</h4>
            <p>
              Historical questions submitted to oracles at Dodona, preserved on papyrus. Covering daily concerns like health, 
              marriage, business, and legal matters, these queries demonstrate how people consulted oracles for guidance.
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
        <p>
          The system uses transformer models to encode each sentence into mathematical vectors for semantic search. 
          For Oracle mode, atmospheric noise provides true randomness for passage selection. All texts appear in 
          parallel Greek-English format with AI-generated commentary.
        </p>
        <p>
          This combines computational text analysis with traditional divination methods, creating a digital approach 
          to bibliomantic consultation.
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
            <li><strong>Orphic Golden Tablets</strong> (5th-2nd century BCE): Graf & Johnston, <em>Ritual Texts for the Afterlife</em>; Edmonds (2010)</li>
            <li><strong>Dodona Oracle Queries</strong> (5th-2nd century BCE): Dodona Online (DOL) curated scholarly database</li>
          </ul>
          <p><em>Note: English translations generated by GPT-5 reasoning system from original Greek texts.</em></p>
        </div>
      </section>

      <section className="about-section">
        <h3>Contact</h3>
        <p>
          For questions, feedback, or collaboration inquiries, contact us at{' '}
          <a href="mailto:social@neumannsworkshop.com" style={{color: '#a0a0a0', textDecoration: 'underline'}}>
            social@neumannsworkshop.com
          </a>
        </p>
      </section>
    </div>
    
    <Footer />
  </div>
);