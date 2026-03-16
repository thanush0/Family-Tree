# 🚀 Quick Start: 3D Temporal Visualization

## Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm install
node init-db.js
node seed.js
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

## Access the App

Open browser to: **http://localhost:3000**

The app will load in **3D Temporal mode** by default!

---

## 🎮 Quick Controls

| What to Do | How to Do It |
|------------|--------------|
| **Rotate view** | Left-click and drag |
| **Pan around** | Right-click and drag |
| **Zoom** | Scroll wheel |
| **Select person** | Click on a person card |
| **Reset camera** | Click "Reset View" button (bottom right) |
| **Switch modes** | Use top bar: 2D / 3D / 🌌 Temporal |

---

## 🌟 What You'll See

### Person Cards (Floating 3D rectangles)
- **Blue** = Male
- **Pink** = Female
- **Purple** = Other
- Cards face you automatically (billboard effect)
- Gentle floating animation

### When You Click a Person:
- Selected person turns **GOLD**
- Parents highlighted in **GREEN** (above)
- Children highlighted in **CYAN** (below)
- Spouses highlighted in **PURPLE** (same level)
- Siblings highlighted in **AMBER** (same level)
- Camera smoothly flies to focus on them
- Everything else fades out

### Connection Lines (Smooth curves)
- Parent → Child: Flowing downward curves
- Spouse ↔ Spouse: Gentle horizontal arcs
- Sibling ↔ Sibling: Subtle curves
- All lines pulse when highlighted

### Event Spheres (💍 Marriages)
- Floating spheres between spouses
- Show marriage dates
- Rotate gently
- Currently auto-generated from spouse relationships

---

## 🌌 The "Time = Space" Concept

### Vertical = Time
- **Top of screen** = Older dates (grandparents)
- **Bottom of screen** = Newer dates (children)
- Children **always** below parents

### Horizontal = Family Groups
- Spouses side-by-side
- Siblings spread out
- Families grouped together

### Depth = Organic Feel
- Slight front-to-back variation
- Makes it feel 3D, not flat
- More immersive

---

## 🎨 Sample Data Included

The seed script creates a 3-generation family:

**Generation 0 (Grandparents):** 4 people
- Robert & Mary Johnson
- David & Patricia Williams

**Generation 1 (Parents):** 4 people  
- James Johnson (married to Sarah Williams)
- Michael Johnson (married to Jennifer Smith)

**Generation 2 (Children):** 5 people
- Emily & David Johnson
- Jessica, Christopher & Matthew Johnson

---

## 🔧 Toggle Between Views

Click the buttons at the top:

1. **2D** - Traditional flat tree (React Flow)
2. **3D** - Generation-based 3D view
3. **🌌 Temporal** - NEW! Time-based 3D universe

---

## ✨ Cool Things to Try

1. **Click Robert Johnson** (grandparent)
   - Watch camera fly to him
   - See all descendants highlighted below

2. **Click Emily Johnson** (child)
   - See parents highlighted above
   - Notice how lineage flows upward

3. **Rotate the view**
   - Orbit around the family
   - Notice cards always face you
   - See the depth and curves

4. **Zoom way out**
   - Appreciate the whole temporal structure
   - Notice fog creates depth

5. **Click "Reset View"**
   - Smooth animation back to overview

---

## 🎯 What Makes It Special

### Traditional Family Trees
- Flat, rigid boxes
- Hard to understand relationships
- Time is just implied

### 3D Temporal View  
- ✅ Time flows **vertically** (intuitive)
- ✅ Navigate like exploring a **memory world**
- ✅ Smooth curves (not rigid lines)
- ✅ Cards face you (billboard effect)
- ✅ Beautiful memorial aesthetic
- ✅ Depth fog and atmosphere
- ✅ Animated camera focus
- ✅ Relationship-based highlighting

---

## 🐛 If Something's Wrong

### "Cannot connect to server"
→ Make sure backend is running on port 5000

### "Blank screen"
→ Check browser console (F12) for errors

### "Cards at weird positions"
→ Birth dates should be set in the data

### "Camera too close/far"
→ Use mouse wheel to zoom, or click "Reset View"

---

## 📱 Browser Requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- WebGL support (almost all modern browsers)
- Hardware acceleration recommended

---

## 🎓 Next Steps

1. **Add your own family data** via "Add Person" button
2. **Explore relationships** by clicking different people  
3. **Customize appearance** (see full guide)
4. **Read** `3D_TEMPORAL_VISUALIZATION_GUIDE.md` for details

---

## 💡 Pro Tips

- **Best viewed with 3-5 generations** of data
- **Include birth dates** for accurate temporal positioning
- **Complete all relationships** for full lineage highlighting
- **Take your time** exploring - it's meant to be immersive

---

**Welcome to the memory universe!** 🌌✨

Questions? Check the full guide: `3D_TEMPORAL_VISUALIZATION_GUIDE.md`
