# Backend - 3D Family Tree API

Express.js REST API for managing family tree data with PostgreSQL.

## Structure

```
backend/
├── config/
│   └── database.js        # PostgreSQL connection
├── models/
│   └── Person.js          # Sequelize models
├── routes/
│   └── personRoutes.js    # API endpoints
├── server.js              # Express server
├── init-db.js             # Database initialization
├── seed.js                # Sample data seeder
├── package.json           # Dependencies
└── .env                   # Configuration
```

## Installation

```bash
npm install
```

## Configuration

Edit `.env` file:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/family_tree
POSTGRES_URI=postgresql://postgres:postgres@localhost:5432/family_tree
NODE_ENV=development
```

Adjust the connection string with your PostgreSQL credentials:
- Username: `postgres` (or your PostgreSQL user)
- Password: `postgres` (or your PostgreSQL password)
- Host: `localhost`
- Port: `5432` (default PostgreSQL port)
- Database: `family_tree`

## Running

```bash
# Development
npm start

# With nodemon (auto-reload)
npm run dev
```

## Initialize Database

```bash
# First time setup - creates tables
node init-db.js
```

## Seed Database

```bash
# Populates database with sample data
node seed.js
```

This creates 13 sample persons across 3 generations.

## API Endpoints

### Persons
- `GET /api/persons` - Get all persons
- `GET /api/persons/:id` - Get single person
- `POST /api/persons` - Create person
- `PUT /api/persons/:id` - Update person
- `DELETE /api/persons/:id` - Delete person

### Tree
- `GET /api/persons/tree/structure` - Get optimized tree structure

### Search
- `POST /api/persons/search` - Search persons by name

### Health
- `GET /api/health` - Server health check

## Data Model

```javascript
Person {
  id: UUID (Primary Key),
  name: String,
  gender: ENUM("Male", "Female", "Other"),
  dob: Date,
  photo: String,
  generation: Integer,
  position: JSONB { x, y, z },
  createdAt: Timestamp,
  updatedAt: Timestamp
}

PersonRelationship {
  id: UUID (Primary Key),
  parentId: UUID (Foreign Key -> Person),
  childId: UUID (Foreign Key -> Person),
  type: ENUM("parent-child", "spouse"),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Relationships are managed through the `PersonRelationship` junction table:
- Parent-child relationships: `type = "parent-child"`
- Spouse relationships: `type = "spouse"`

## Dependencies

- express - Web framework
- sequelize - PostgreSQL ORM
- pg - PostgreSQL client
- pg-hstore - Serialization support for Sequelize
- cors - Cross-origin support
- dotenv - Environment variables
- body-parser - Request parsing

## Development

```bash
# Install dependencies
npm install

# Start PostgreSQL
brew services start postgresql  # macOS
# or check your system's service manager

# Initialize database (first time only)
node init-db.js

# Seed database
node seed.js

# Start server
npm start
```

Server runs on http://localhost:5000

## Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Get all persons
curl http://localhost:5000/api/persons

# Get tree structure
curl http://localhost:5000/api/persons/tree/structure
```

## Production

Set environment variables:
```
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
PORT=5000
```

Recommended cloud PostgreSQL providers:
- Heroku Postgres
- Railway
- AWS RDS
- Digital Ocean Managed PostgreSQL
- Supabase

Deploy to Heroku, Railway, or similar platform.
