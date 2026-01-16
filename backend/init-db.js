require('dotenv').config();
const { sequelize } = require('./config/database');
const { Person, PersonRelationship } = require('./models/Person');

async function initDatabase() {
  try {
    console.log('🔄 Initializing PostgreSQL database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Create tables
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables created/updated');

    console.log('\n📊 Database Schema:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Tables:');
    console.log('  - persons (id, name, gender, dob, photo, generation, position)');
    console.log('  - person_relationships (id, parentId, childId, type)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Database initialized successfully!');
    console.log('\nYou can now run:');
    console.log('  - npm start (to start the server)');
    console.log('  - node seed.js (to populate with sample data)');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    await sequelize.close();
    process.exit(1);
  }
}

initDatabase();
