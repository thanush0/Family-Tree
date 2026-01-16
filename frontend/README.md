# Frontend - 3D Family Tree UI

React application with Three.js 3D visualization.

## Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Scene3D.js          # Main 3D scene
│   │   ├── PersonNode.js        # 3D person nodes
│   │   ├── ConnectionLine.js    # Relationship lines
│   │   ├── Sidebar.js           # Profile panel
│   │   ├── Controls.js          # Top navigation
│   │   └── PersonForm.js        # Add/Edit form
│   ├── services/
│   │   └── api.js               # API client
│   ├── utils/
│   │   └── layoutEngine.js      # Layout algorithm
│   ├── App.js                   # Main component
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── .env
```

## Installation

```bash
npm install
```

## Configuration

Edit `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running

```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm test
```

## Key Technologies

- **React 18** - UI framework
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - 3D graphics engine
- **@react-three/drei** - 3D helpers
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **GSAP** - Animation library

## Components

### Scene3D
Main 3D scene controller with camera, lights, and rendering logic.

### PersonNode
Individual 3D node representing a person with hover and click interactions.

### ConnectionLine
Lines connecting related persons (parent-child, spouse).

### Sidebar
Right panel showing detailed person information.

### Controls
Top navigation bar with search, view modes, and add button.

### PersonForm
Modal form for creating and editing persons.

## Layout Engine

Calculates 3D positions for family tree nodes:
- Groups by generation
- Positions spouses together
- Centers children under parents
- Avoids node overlaps

## API Integration

All API calls go through `services/api.js`:
```javascript
import api from './services/api';

// Get all persons
const persons = await api.getPersons();

// Create person
await api.createPerson(data);

// Update person
await api.updatePerson(id, data);

// Delete person
await api.deletePerson(id);
```

## Styling

Uses Tailwind CSS with custom dark theme:
```javascript
// tailwind.config.js
colors: {
  'dark-bg': '#0a0e27',
  'dark-card': '#1a1f3a',
  'male': '#3b82f6',
  'female': '#ec4899',
  'other': '#a855f7',
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Serve production build
npx serve -s build
```

## Environment Variables

```env
# Development
REACT_APP_API_URL=http://localhost:5000/api

# Production
REACT_APP_API_URL=https://your-api.herokuapp.com/api
```

## Performance

- Initial load: < 2s
- 3D render: < 500ms
- 60fps target
- Optimized for up to 200 nodes

## Accessibility

- Keyboard navigation (basic)
- Focus indicators
- WCAG color contrast
- Screen reader labels

## Deployment

Build and deploy to:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- Any static host

```bash
npm run build
# Deploy 'build' folder
```
