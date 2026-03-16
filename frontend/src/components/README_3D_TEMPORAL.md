# 🌌 3D Temporal Visualization Components

## Overview

This directory contains the components for the **3D Temporal Family Tree Visualization** - an immersive way to explore family history where time flows vertically through 3D space.

---

## Components

### Scene3DTemporal.js ⭐ NEW
**Main 3D temporal scene container**

- Renders the complete 3D temporal universe
- Manages layout calculations via temporalLayoutEngine
- Coordinates person nodes, event nodes, and connections
- Handles camera animations and focus transitions
- Implements lineage highlighting system
- Creates atmospheric background with fog and stars

**Key Features:**
- Gradient sky background (memorial aesthetic)
- Depth fog for atmosphere
- GSAP-powered camera animations
- Interactive instructions overlay
- Smooth transitions on person selection

**Props:**
```javascript
{
  persons: Array,          // Array of person objects
  selectedPerson: Object,  // Currently selected person
  onPersonSelect: Function, // Callback when person clicked
  viewMode: String        // 'full' | 'ancestors' | 'descendants'
}
```

---

### EventNode.js ⭐ NEW
**3D spherical event markers**

- Renders significant life events (marriages, births, deaths)
- Floating spheres with glow rings
- Date display in 3D space
- Interactive hover tooltips
- Pulsing and rotation animations

**Event Types:**
- 💍 Marriage (Pink/Purple)
- 🌟 Birth (Green)
- 🕊️ Death (Gray)
- 📅 Custom events (Amber)

**Props:**
```javascript
{
  event: {
    id: String,
    type: 'marriage' | 'birth' | 'death',
    date: Date,
    participants: Array,
    description: String
  },
  position: [x, y, z],
  isHighlighted: Boolean,
  onSelect: Function,
  onHover: Function
}
```

---

### ConnectionLine.js ✨ ENHANCED
**Smooth Catmull-Rom curved connections**

- Upgraded from simple bezier to Catmull-Rom splines
- Volumetric tube geometry (not flat lines)
- Emissive glow effects
- Pulsing animations on highlight
- Different curve styles for relationship types

**Connection Types:**
- **Parent-Child**: Flowing downward curves
- **Spouse**: Gentle horizontal arcs
- **Sibling**: Subtle connecting curves

**Props:**
```javascript
{
  start: [x, y, z],
  end: [x, y, z],
  type: 'parent-child' | 'spouse' | 'sibling',
  color: String,
  isHighlighted: Boolean,
  opacity: Number
}
```

---

### PersonNode.js ✨ ENHANCED
**Person cards with billboard effect**

- 3D rounded cards displaying person info
- Billboard effect: always faces camera (Y-axis rotation)
- Gender-based colors (Blue/Pink/Purple)
- Relationship-based highlighting
- Hover tooltips with family stats
- Smooth animations (floating, scaling)

**Enhancements:**
- ✅ Billboard rotation to face camera
- ✅ Improved opacity management
- ✅ Better animation timing

**Props:**
```javascript
{
  person: Object,
  position: [x, y, z],
  isSelected: Boolean,
  isHighlighted: Boolean,
  relationshipType: String,
  onSelect: Function,
  onHover: Function,
  selectedPersonExists: Boolean
}
```

---

## Supporting Files

### utils/temporalLayoutEngine.js ⭐ NEW
**Time-based 3D layout algorithm**

Main class: `TemporalLayoutEngine`

**Responsibilities:**
1. Convert birth dates to Y-axis positions
2. Calculate time range from data
3. Group families together
4. Position children below parents
5. Add organic depth variation
6. Generate marriage event nodes
7. Position events between participants

**Key Methods:**
```javascript
calculateTemporalLayout()  // Main entry point
calculateTimeRange()       // Analyze date range
positionPersonsByTime()    // Time-based positioning
applyFamilyGrouping()      // Cluster families
addDepthVariation()        // Organic Z-axis
createEventNodes()         // Generate events
getEventPosition()         // Position events
```

**Configuration:**
```javascript
this.timeScale = 0.1;          // Years to 3D units
this.horizontalSpacing = 8;     // Space between siblings
this.depthVariation = 3;        // Z-axis randomization
```

---

## Usage Example

```javascript
import Scene3DTemporal from './components/Scene3DTemporal';

function App() {
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  return (
    <Scene3DTemporal
      persons={persons}
      selectedPerson={selectedPerson}
      onPersonSelect={(id) => {
        const person = persons.find(p => p.id === id);
        setSelectedPerson(person);
      }}
      viewMode="full"
    />
  );
}
```

---

## Architecture

```
Scene3DTemporal
    ├── Canvas (React Three Fiber)
    │   ├── Camera & Controls
    │   ├── Lighting System
    │   │   ├── Ambient Light
    │   │   ├── Directional Lights
    │   │   ├── Point Light
    │   │   └── Hemisphere Light
    │   ├── Atmosphere
    │   │   ├── Background Gradient
    │   │   ├── Stars
    │   │   └── Fog
    │   ├── PersonNodes[]
    │   │   └── PersonNode (with billboard)
    │   ├── EventNodes[]
    │   │   └── EventNode (spheres)
    │   └── ConnectionLines[]
    │       └── ConnectionLine (curves)
    └── UI Overlays
        ├── Instructions
        └── Reset Button
```

---

## Key Concepts

### Time as Space
The Y-axis represents **chronological time**:
- Higher Y = Older dates (grandparents)
- Lower Y = Newer dates (children)
- Conversion: `y = (maxYear - birthYear) * timeScale`

### Billboard Effect
Person cards always face the camera:
- Implemented in `useFrame` hook
- Y-axis rotation calculated from camera position
- Natural, non-disorienting rotation

### Family Grouping
Families stay together spatially:
- Spouses positioned close horizontally
- Children fan out below parents
- Siblings have organic spacing

### Event Anchors
Events act as structural hubs:
- Marriage spheres between spouses
- Positioned above person nodes
- Connect relationships visually

---

## Performance

**Optimizations:**
- Memoized curve calculations (`useMemo`)
- Memoized geometry creation
- GPU-accelerated fog
- Efficient useFrame animations
- Minimal re-renders

**Metrics:**
- 60fps with 100 nodes
- ~50fps with 500 nodes
- LOD recommended for 1000+

---

## Customization

### Colors
Edit in respective component files:
- `Scene3DTemporal.js`: Background gradient
- `PersonNode.js`: Person colors
- `EventNode.js`: Event colors
- `ConnectionLine.js`: Line colors

### Spacing
Edit in `temporalLayoutEngine.js`:
```javascript
this.timeScale = 0.1;          // More = vertical spread
this.horizontalSpacing = 8;     // More = horizontal spread
this.depthVariation = 3;        // More = depth effect
```

### Camera
Edit in `Scene3DTemporal.js`:
```javascript
position={[0, 10, 30]}  // Default camera position
fov={65}                 // Field of view
minDistance={5}          // Zoom limits
maxDistance={100}
```

---

## Troubleshooting

**Nodes at wrong positions:**
- Check birth dates are valid ISO strings
- Verify generation numbers are correct
- Ensure relationships are properly linked

**Camera animations jerky:**
- GSAP must be installed (`npm install gsap`)
- Check console for animation errors

**Lines appear jagged:**
- Increase tube segments in ConnectionLine.js
- Check WebGL support in browser

**Performance issues:**
- Reduce star count
- Lower tube geometry resolution
- Implement LOD system

---

## Future Enhancements

- [ ] Birth/death events auto-generated
- [ ] Timeline scrubber
- [ ] Photo textures on cards
- [ ] VR/AR support
- [ ] Video export
- [ ] Multiple marriages per person
- [ ] Custom event types
- [ ] Shader effects for lines

---

## Dependencies

```json
{
  "three": "^0.163.0",
  "@react-three/fiber": "^8.16.0",
  "@react-three/drei": "^9.105.0",
  "gsap": "^3.12.0"
}
```

---

## Testing

The components are tested with sample family data from `backend/seed.js`:
- 3 generations
- 13 people
- Multiple marriages
- Various relationship types

To test:
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Open http://localhost:3000
4. Click 🌌 Temporal button

---

## Documentation

Full documentation available:
- `3D_TEMPORAL_VISUALIZATION_GUIDE.md` - Complete guide
- `QUICK_START_3D_TEMPORAL.md` - Quick reference
- `3D_TEMPORAL_BUILD_SUMMARY.md` - Build details
- `IMPLEMENTATION_CHECKLIST.md` - Feature checklist
- `ARCHITECTURE_OVERVIEW.md` - System architecture

---

**Built with ❤️ to make family history exploration magical.** 🌌✨
