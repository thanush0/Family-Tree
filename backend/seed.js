require('dotenv').config();
const { sequelize } = require('./config/database');
const { Person, PersonRelationship } = require('./models/Person');

// Sample 3-generation family tree data
const sampleFamily = [
  // Generation 0 - Grandparents
  {
    name: 'Robert Johnson',
    gender: 'Male',
    dob: new Date('1945-03-15'),
    parents: [],
    spouse: [],
    children: [],
    generation: 0
  },
  {
    name: 'Mary Johnson',
    gender: 'Female',
    dob: new Date('1947-07-22'),
    parents: [],
    spouse: [],
    children: [],
    generation: 0
  },
  {
    name: 'William Smith',
    gender: 'Male',
    dob: new Date('1943-11-08'),
    parents: [],
    spouse: [],
    children: [],
    generation: 0
  },
  {
    name: 'Patricia Smith',
    gender: 'Female',
    dob: new Date('1946-05-30'),
    parents: [],
    spouse: [],
    children: [],
    generation: 0
  },

  // Generation 1 - Parents
  {
    name: 'Michael Johnson',
    gender: 'Male',
    dob: new Date('1970-09-12'),
    parents: [], // Will be set after creation
    spouse: [],
    children: [],
    generation: 1
  },
  {
    name: 'Jennifer Smith',
    gender: 'Female',
    dob: new Date('1972-02-18'),
    parents: [], // Will be set after creation
    spouse: [],
    children: [],
    generation: 1
  },
  {
    name: 'David Johnson',
    gender: 'Male',
    dob: new Date('1968-06-25'),
    parents: [], // Will be set after creation
    spouse: [],
    children: [],
    generation: 1
  },
  {
    name: 'Sarah Williams',
    gender: 'Female',
    dob: new Date('1969-12-03'),
    parents: [],
    spouse: [],
    children: [],
    generation: 1
  },

  // Generation 2 - Children
  {
    name: 'Emily Johnson',
    gender: 'Female',
    dob: new Date('1995-04-14'),
    parents: [],
    spouse: [],
    children: [],
    generation: 2
  },
  {
    name: 'James Johnson',
    gender: 'Male',
    dob: new Date('1997-08-21'),
    parents: [],
    spouse: [],
    children: [],
    generation: 2
  },
  {
    name: 'Sophia Johnson',
    gender: 'Female',
    dob: new Date('2000-01-10'),
    parents: [],
    spouse: [],
    children: [],
    generation: 2
  },
  {
    name: 'Daniel Johnson',
    gender: 'Male',
    dob: new Date('1993-11-30'),
    parents: [],
    spouse: [],
    children: [],
    generation: 2
  },
  {
    name: 'Olivia Johnson',
    gender: 'Female',
    dob: new Date('1996-07-16'),
    parents: [],
    spouse: [],
    children: [],
    generation: 2
  }
];

async function seedDatabase() {
  try {
    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('🗑️  Database reset and tables created');

    // Create persons without relationships first
    const createdPersons = await Person.bulkCreate(sampleFamily);
    console.log(`✅ Created ${createdPersons.length} persons`);

    // Now establish relationships
    const [robert, mary, william, patricia, michael, jennifer, david, sarah, 
           emily, james, sophia, daniel, olivia] = createdPersons;

    // Set spouse relationships (Generation 0)
    await PersonRelationship.bulkCreate([
      { parentId: robert.id, childId: mary.id, type: 'spouse' },
      { parentId: william.id, childId: patricia.id, type: 'spouse' },
      // Generation 1
      { parentId: michael.id, childId: jennifer.id, type: 'spouse' },
      { parentId: david.id, childId: sarah.id, type: 'spouse' }
    ]);

    // Set parent-child relationships (Gen 0 -> Gen 1)
    await PersonRelationship.bulkCreate([
      { parentId: robert.id, childId: michael.id, type: 'parent-child' },
      { parentId: robert.id, childId: david.id, type: 'parent-child' },
      { parentId: mary.id, childId: michael.id, type: 'parent-child' },
      { parentId: mary.id, childId: david.id, type: 'parent-child' },
      { parentId: william.id, childId: jennifer.id, type: 'parent-child' },
      { parentId: patricia.id, childId: jennifer.id, type: 'parent-child' }
    ]);

    // Set parent-child relationships (Gen 1 -> Gen 2)
    await PersonRelationship.bulkCreate([
      { parentId: michael.id, childId: emily.id, type: 'parent-child' },
      { parentId: michael.id, childId: james.id, type: 'parent-child' },
      { parentId: michael.id, childId: sophia.id, type: 'parent-child' },
      { parentId: jennifer.id, childId: emily.id, type: 'parent-child' },
      { parentId: jennifer.id, childId: james.id, type: 'parent-child' },
      { parentId: jennifer.id, childId: sophia.id, type: 'parent-child' },
      { parentId: david.id, childId: daniel.id, type: 'parent-child' },
      { parentId: david.id, childId: olivia.id, type: 'parent-child' },
      { parentId: sarah.id, childId: daniel.id, type: 'parent-child' },
      { parentId: sarah.id, childId: olivia.id, type: 'parent-child' }
    ]);

    console.log('✅ Relationships established');

    console.log('\n📊 Sample Family Tree Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Generation 0 (Grandparents): 4 persons');
    console.log('Generation 1 (Parents): 4 persons');
    console.log('Generation 2 (Children): 5 persons');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Database seeded successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await sequelize.close();
    process.exit(1);
  }
}

seedDatabase();
