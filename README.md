# 🌳 Family Tree Application

> A modern, intelligent 3D/2D interactive family tree visualization application with advanced relationship management and beautiful UI.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📸 Screenshots

### Full Tree View
![Family Tree View](screenshot/full%20tree%20view.png)
*Interactive 2D family tree with color-coded connection highlighting*

---

## ✨ Key Features

### 🎨 **Dual Visualization Modes**
- **3D View** - Immersive three-dimensional family tree with orbit controls
- **2D View** - Clean, hierarchical layout with React Flow
- Seamless toggle between modes

### 🧠 **Intelligent Relationship Management**

#### **Smart Auto-Fill**
- 👨‍👩‍👧 **Auto-select spouse when selecting parents** - Select father → mother automatically selected
- 👥 **Auto-add siblings from parents** - Select parents → all their children become siblings
- 👶 **Auto-add children from spouse** - Select spouse → all their children added to yours
- 🔗 **Complete sibling network** - All siblings automatically connected to each other

#### **Relationship Types**
- **Parent-Child** - Blue curved lines with arrows
- **Spouse** - Purple dashed horizontal lines
- **Sibling** - Amber straight lines

### 🎯 **Connection Highlighting System**

Click any card to see color-coded connections:

| Color | Relationship | Visual Effect |
|-------|--------------|---------------|
| 🟡 **Gold** | Selected person | Glowing gold background & border |
| 🟢 **Green** | Parents | Green cards & connection lines |
| 🔵 **Cyan** | Children | Cyan cards & connection lines |
| 🟣 **Purple** | Spouses | Purple cards & connection lines |
| 🟠 **Amber** | Siblings | Amber cards & connection lines |
| 🌫️ **Faded** | Unrelated | 30% opacity |

### 📊 **Smart Generation System**
- **Root-based hierarchy** - Ancestors with no parents = Generation 0
- **Automatic calculation** - Children = Parent's generation + 1
- **Spouse synchronization** - Married couples always in same generation
- **Pure relationship-based** - No birth year required
- **Real-time updates** - Recalculates on relationship changes

### 💡 **User Experience Features**
- **Static card layout** - Non-draggable, stable positions
- **Relationship counter** - Hover to see detailed breakdown
- **Smooth animations** - Professional transitions and highlighting
- **Responsive design** - Works on all screen sizes
- **Dynamic legend** - Shows color meanings when card is selected

## Tech Stack

### Frontend
- React
- React Three Fiber (3D visualization)
- React Flow (2D visualization)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- Sequelize ORM
- SQLite database
- CORS enabled

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Installation

#### 1️⃣ Clone the Repository
```bash
git clone <repository-url>
cd FamilyTree
```

#### 2️⃣ Install Backend Dependencies
```bash
cd backend
npm install
```

#### 3️⃣ Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

#### 4️⃣ Initialize Database (Optional)
```bash
cd ../backend
node seed.js  # Loads sample family data
```

### Running the Application

#### Terminal 1: Start Backend Server
```bash
cd backend
npm start
```
✅ Backend runs on: **http://localhost:5000**

#### Terminal 2: Start Frontend Development Server
```bash
cd frontend
npm start
```
✅ Frontend runs on: **http://localhost:3000**

The application will automatically open in your default browser!

---

## 📚 Usage Guide

### Creating Your Family Tree

#### **Step 1: Add Root Ancestors**
1. Click **"Add New Person"**
2. Enter name, gender, and birth date (optional)
3. Leave parents empty (these are your root ancestors)
4. Click **Save**

#### **Step 2: Add Their Spouse**
1. Create another person
2. In the **Spouse** field, select the first person
3. Both are now in Generation 0 (same generation)

#### **Step 3: Add Children**
1. Create a new person
2. Select both parents (select one → spouse auto-selected!)
3. Generation automatically calculated (Gen 1)
4. Add more children - they'll auto-link as siblings!

#### **Step 4: Explore the Tree**
- **Click any card** to see color-coded connections
- **Hover cards** to see relationship counts
- **Toggle 2D/3D** view in the top controls
- **Zoom & Pan** to navigate large trees

### Editing Relationships

1. Click on any person card
2. Click **"Edit Person"** in the sidebar
3. Modify relationships:
   - Select parents → siblings auto-fill
   - Select spouse → children merge
   - Select sibling → complete sibling group
4. Click **Save** - tree updates automatically!

---

## 🗄️ Database Management

### Seed Sample Data
```bash
cd backend
node seed.js
```
Creates a sample family with multiple generations.

### Clear All Data
```bash
cd backend
node init-db.js
```
⚠️ **Warning:** This deletes all family data!

### Database Location
- Type: **SQLite**
- File: Auto-created in backend directory
- Protected: ✅ Never committed to git (.gitignore)

## 🔌 API Documentation

### Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/persons` | Get all persons with relationships | Array of person objects |
| `GET` | `/api/persons/:id` | Get person by ID | Single person object |
| `POST` | `/api/persons` | Create new person | Created person object |
| `PUT` | `/api/persons/:id` | Update person | Updated person object |
| `DELETE` | `/api/persons/:id` | Delete person | Success message |
| `GET` | `/api/health` | Health check | Server status |

### Request/Response Examples

#### Create Person
```bash
POST /api/persons
Content-Type: application/json

{
  "name": "John Doe",
  "gender": "Male",
  "dob": "1990-05-15",
  "photo": "base64_encoded_image_or_url",
  "parents": ["parent-id-1", "parent-id-2"],
  "spouse": ["spouse-id"],
  "children": ["child-id-1", "child-id-2"],
  "siblings": ["sibling-id"]
}
```

#### Response
```json
{
  "id": "generated-uuid",
  "name": "John Doe",
  "gender": "Male",
  "dob": "1990-05-15T00:00:00.000Z",
  "generation": 1,
  "parents": [...],
  "children": [...],
  "spouses": [...],
  "siblings": [...]
}
```

## Project Structure

```
FamilyTree/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Person.js
│   ├── routes/
│   │   └── personRoutes.js
│   ├── init-db.js
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConnectionLine.js
│   │   │   ├── Controls.js
│   │   │   ├── FamilyTree2D.js
│   │   │   ├── PersonForm.js
│   │   │   ├── PersonNode.js
│   │   │   ├── PersonNode2D.js
│   │   │   ├── Scene3D.js
│   │   │   └── Sidebar.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── layoutEngine.js
│   │   │   └── layoutEngine2D.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Features in Detail

### Relationship Types
1. **Parent-Child** - Blue curved lines with arrows
2. **Spouse** - Purple dashed horizontal lines
3. **Sibling** - Amber straight lines

### Smart Auto-Fill
- Select one parent → spouse auto-selected + all their children become siblings
- Select one spouse → all their children added
- Select one sibling → all their siblings added (complete sibling group)

### Generation Calculation
- Root ancestors (no parents) = Generation 0
- Children = Parent's generation + 1
- Spouses = Same generation
- Automatic recalculation on relationship changes

## 🎯 Features in Detail

### Complete Sibling Network
When you add a sibling to any person, the system automatically:
- Finds all existing siblings of that person
- Finds all siblings of the selected sibling
- Creates a complete network where **every sibling is connected to every other sibling**
- Maintains mathematical completeness (transitive closure)

**Example:**
```
1. Alice has siblings: Bob, Charlie
2. Create Diana, select Bob as sibling
3. System auto-adds: Alice, Charlie
4. Result: Diana ↔ Alice ↔ Bob ↔ Charlie (complete network)
```

### Generation Calculation Priority
```
Priority 1: Parent Relationships
  → generation = parent's generation + 1

Priority 2: Children Relationships (backwards)
  → generation = child's generation - 1

Priority 3: Spouse Relationships
  → generation = spouse's generation

Priority 4: Root Ancestor
  → generation = 0 (no parents)
```

### Connection Highlighting Algorithm
```javascript
1. User clicks card → Selected person (gold)
2. System identifies all relationships
3. Parents → Green cards + green lines (5px thick)
4. Children → Cyan cards + cyan lines (5px thick)
5. Spouses → Purple cards + purple lines (5px thick)
6. Siblings → Amber cards + amber lines (5px thick)
7. Unrelated → Faded to 30% opacity
8. Smooth transitions (0.3s cubic-bezier)
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.x |
| **React Three Fiber** | 3D Visualization | Latest |
| **@react-three/drei** | 3D Helpers | Latest |
| **React Flow** | 2D Graph Visualization | Latest |
| **Tailwind CSS** | Styling | 3.x |
| **Axios** | HTTP Client | Latest |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime Environment | 14+ |
| **Express** | Web Framework | 4.x |
| **Sequelize** | ORM | 6.x |
| **SQLite3** | Database | 5.x |
| **CORS** | Cross-Origin Support | Latest |

---

## 📁 Project Structure

```
FamilyTree/
├── 📄 README.md                    # This file
├── 📄 LICENSE                      # MIT License
├── 📄 .gitignore                   # Git ignore rules (includes database protection)
│
├── 📁 backend/                     # Backend Server
│   ├── 📁 config/
│   │   └── database.js             # Database configuration
│   ├── 📁 models/
│   │   └── Person.js               # Person & Relationship models
│   ├── 📁 routes/
│   │   └── personRoutes.js         # API routes with smart logic
│   ├── init-db.js                  # Database initializer
│   ├── seed.js                     # Sample data seeder
│   ├── server.js                   # Express server
│   └── package.json                # Backend dependencies
│
├── 📁 frontend/                    # Frontend Application
│   ├── 📁 public/
│   │   └── index.html              # HTML template
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── ConnectionLine.js       # 3D connection lines
│   │   │   ├── Controls.js             # View toggle controls
│   │   │   ├── FamilyTree2D.js         # 2D tree view (React Flow)
│   │   │   ├── GenerationBands.js      # Generation visual bands
│   │   │   ├── PersonForm.js           # Add/Edit person form
│   │   │   ├── PersonNode.js           # 3D person node
│   │   │   ├── PersonNode2D.js         # 2D person card
│   │   │   ├── Scene3D.js              # 3D scene setup
│   │   │   ├── Sidebar.js              # Information sidebar
│   │   │   └── TimelineScale.js        # Timeline visualization
│   │   ├── 📁 services/
│   │   │   └── api.js                  # API client
│   │   ├── 📁 utils/
│   │   │   ├── layoutEngine.js         # 3D layout algorithm
│   │   │   ├── layoutEngine2D.js       # 2D layout algorithm
│   │   │   └── suppressResizeObserverError.js
│   │   ├── App.js                      # Main application
│   │   ├── App.css                     # Global styles
│   │   ├── index.js                    # React entry point
│   │   └── index.css                   # Tailwind imports
│   └── package.json                    # Frontend dependencies
│
└── 📁 screenshot/                  # Application screenshots
    └── full tree view.png          # Main view screenshot
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues
1. Check existing issues first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Submitting Pull Requests
1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update README if adding features
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Three Fiber** - For amazing 3D capabilities
- **React Flow** - For powerful 2D graph visualization
- **Sequelize** - For excellent ORM functionality
- **Tailwind CSS** - For rapid UI development

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: [Your Email]

---

## 🎉 Star History

If you find this project useful, please consider giving it a ⭐!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/FamilyTree&type=Date)](https://star-history.com/#yourusername/FamilyTree&Date)

---

<div align="center">
  <p>Made with ❤️ for families everywhere</p>
  <p>© 2025 Family Tree Application. All rights reserved.</p>
</div>
