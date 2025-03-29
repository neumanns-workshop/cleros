# SORTES Web Interface

This is the web interface for the SORTES project, providing an interactive user interface for the algorithmic divination system based on the Orphic Hymns.

## Features

### Divination Interface
- Clean and minimalist interface for oracle queries
- Typewriter effect for dramatic presentation of oracle responses
- Collapsible view for expanded context
- Dark mode aesthetic suited to the mystical context

### Available Sources
- **Orphic Hymns** - Currently implemented and fully functional
- **Coming Soon:** Homer, Virgil, and Gnostic texts (options visible but currently disabled)

### Deity Classification System
- Deity names in the hymns are automatically highlighted according to their category:
  - **Olympian** - Major gods residing on Mount Olympus (Zeus, Apollo, Athene, etc.)
  - **Chthonic** - Underworld or earth deities (Persephone, Plouton, etc.)
  - **Titan** - Pre-Olympian primordial deities (Kronos, Rhea, etc.)
  - **Nature** - Deities representing natural forces (Nereus, Pan, etc.)
  - **Abstract** - Deities representing concepts (Nemesis, Sleep, etc.)
  - **Other** - Miscellaneous divine entities not fitting other categories

### Alias System
- Recognizes multiple variants and epithets of deity names, mapping them to their primary names:
  - Apollo -> Pythian, Apollon, Grynean, etc.
  - Dionysos -> Bacchos, Bromios, Perikionios, etc.
  - Plouton -> Hades, Chthonic Zeus, etc.
  - ...and many more

### Support Options
- Ko-fi donation button integrated directly in the sidebar
- Popup window implementation for seamless donation experience
- No backend or API keys required

## Deployment

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Production Build
```bash
# Create optimized production build
npm run build

# The build folder will contain static files ready for deployment
```

### Deployment Options

#### Static Hosting (Recommended)
The application is a static site that can be hosted on any static file hosting service:

1. Upload the contents of the `build` directory to your static hosting service (Netlify, Vercel, GitHub Pages, etc.)
2. Configure your hosting service to handle SPA routing by redirecting all requests to index.html

#### Server Deployment with Nginx
If deploying to your own server, use the included nginx.conf as a template:

```bash
# Copy build files to server
scp -r build/ user@your-server:/var/www/sortes

# Configure nginx (use the nginx.conf file as a template)
sudo nano /etc/nginx/sites-available/sortes

# Enable the site
sudo ln -s /etc/nginx/sites-available/sortes /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

For more detailed deployment instructions, see the [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) file.

For information about payment integration, see [../docs/PAYMENT_SETUP.md](../docs/PAYMENT_SETUP.md).

## Technology Stack
- React with TypeScript
- Material-UI components
- Context API for state management
- Custom hooks for data fetching
- CSS variables for theming

## Project Structure
- `components/` - React components
  - `shared/` - Reusable components like HighlightedText
  - `results/` - Oracle response display components
  - `layout/` - Structural layout components including DonateButton
- `context/` - React contexts for state management
  - `DeityContext` - Provider for deity classification data
  - `OracleContext` - Provider for oracle query and result data
- `services/` - Data fetching and processing
  - `deities.ts` - Deity classification and alias handling
- `types/` - TypeScript type definitions
- `utils/` - Utility functions and constants

## Deity Highlighting
The `HighlightedText` component analyzes text and automatically highlights deity names based on the classification data. It supports:
- Multiple occurrences of the same deity
- Exact character offsets for precise highlighting
- Deity aliases and epithets
- CSS variables for consistent coloring

---

*This web interface is part of the SORTES project, synthesizing traditional divinatory frameworks with modern computational techniques to explore the intersection of meaning-making, statistical analysis, and the interpretive act.*
