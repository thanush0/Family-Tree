const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Person = sequelize.define('Person', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: true
  },
  photo: {
    type: DataTypes.TEXT, // Changed from STRING to TEXT to support base64 images
    allowNull: true
  },
  generation: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  position: {
    type: DataTypes.JSONB,
    defaultValue: { x: 0, y: 0, z: 0 }
  }
}, {
  tableName: 'persons',
  timestamps: true
});

// Instance method to calculate generation based purely on relationships (no birth year)
Person.prototype.calculateGeneration = async function() {
  // Priority 1: Check parent relationships (most reliable)
  const parentRelations = await PersonRelationship.findAll({
    where: {
      childId: this.id,
      type: 'parent-child'
    }
  });

  if (parentRelations.length > 0) {
    const parentIds = parentRelations.map(rel => rel.parentId);
    const parents = await Person.findAll({
      where: { id: parentIds }
    });

    if (parents.length > 0) {
      const maxParentGen = Math.max(...parents.map(p => p.generation));
      this.generation = maxParentGen + 1;
      return this.generation;
    }
  }

  // Priority 2: Check children relationships (work backwards from children)
  const childRelations = await PersonRelationship.findAll({
    where: {
      parentId: this.id,
      type: 'parent-child'
    }
  });

  if (childRelations.length > 0) {
    const childIds = childRelations.map(rel => rel.childId);
    const children = await Person.findAll({
      where: { id: childIds }
    });

    if (children.length > 0) {
      const minChildGen = Math.min(...children.map(c => c.generation));
      // Parent is one generation before children
      this.generation = Math.max(0, minChildGen - 1);
      return this.generation;
    }
  }

  // Priority 3: Check spouse relationships (same generation as spouse)
  const spouseRelations = await PersonRelationship.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { parentId: this.id, type: 'spouse' },
        { childId: this.id, type: 'spouse' }
      ]
    }
  });

  if (spouseRelations.length > 0) {
    const spouseIds = spouseRelations.map(rel => 
      rel.parentId === this.id ? rel.childId : rel.parentId
    );
    const spouses = await Person.findAll({
      where: { id: spouseIds }
    });

    if (spouses.length > 0) {
      // Use spouse's generation (they should be in the same generation)
      const spouseGen = spouses[0].generation;
      if (spouseGen !== undefined && spouseGen !== null) {
        this.generation = spouseGen;
        return this.generation;
      }
    }
  }

  // Priority 4: Root ancestor (no parents, no spouse with generation)
  // This person is a root ancestor - Generation 0
  this.generation = 0;
  return 0;
};

// Define PersonRelationship model for many-to-many relationships
const PersonRelationship = sequelize.define('PersonRelationship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'persons',
      key: 'id'
    }
  },
  childId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'persons',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('parent-child', 'spouse', 'sibling'),
    allowNull: false
  }
}, {
  tableName: 'person_relationships',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['parentId', 'childId', 'type']
    }
  ]
});

// Set up associations
// Note: Removed scope from associations as it causes SQL errors
// The scope should be applied in queries instead using through.where
Person.belongsToMany(Person, {
  through: PersonRelationship,
  as: 'parents',
  foreignKey: 'childId',
  otherKey: 'parentId'
});

Person.belongsToMany(Person, {
  through: PersonRelationship,
  as: 'children',
  foreignKey: 'parentId',
  otherKey: 'childId'
});

Person.belongsToMany(Person, {
  through: PersonRelationship,
  as: 'spouses',
  foreignKey: 'parentId',
  otherKey: 'childId'
});

Person.belongsToMany(Person, {
  through: PersonRelationship,
  as: 'siblings',
  foreignKey: 'parentId',
  otherKey: 'childId'
});

// Define associations for PersonRelationship to Person for includes
PersonRelationship.belongsTo(Person, { as: 'Parent', foreignKey: 'parentId' });
PersonRelationship.belongsTo(Person, { as: 'Child', foreignKey: 'childId' });

module.exports = { Person, PersonRelationship };
