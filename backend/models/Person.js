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
    type: DataTypes.STRING,
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

// Instance method to calculate generation based on parents
Person.prototype.calculateGeneration = async function() {
  const parentRelations = await PersonRelationship.findAll({
    where: {
      childId: this.id,
      type: 'parent-child'
    }
  });

  if (parentRelations.length === 0) {
    this.generation = 0;
    return 0;
  }

  const parentIds = parentRelations.map(rel => rel.parentId);
  const parents = await Person.findAll({
    where: { id: parentIds }
  });

  if (parents.length > 0) {
    const maxParentGen = Math.max(...parents.map(p => p.generation));
    this.generation = maxParentGen + 1;
    return this.generation;
  }

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
    type: DataTypes.ENUM('parent-child', 'spouse'),
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

module.exports = { Person, PersonRelationship };
