const express = require('express');
const router = express.Router();
const { Person, PersonRelationship } = require('../models/Person');
const { Op } = require('sequelize');

// GET all persons with populated relationships
router.get('/', async (req, res) => {
  try {
    const persons = await Person.findAll({
      include: [
        {
          model: Person,
          as: 'parents',
          attributes: ['id', 'name', 'gender'],
          through: { 
            attributes: [],
            where: { type: 'parent-child' }
          }
        },
        {
          model: Person,
          as: 'spouses',
          attributes: ['id', 'name', 'gender'],
          through: { 
            attributes: [],
            where: { type: 'spouse' }
          }
        },
        {
          model: Person,
          as: 'children',
          attributes: ['id', 'name', 'gender'],
          through: { 
            attributes: [],
            where: { type: 'parent-child' }
          }
        }
      ],
      order: [['generation', 'ASC']]
    });
    res.json(persons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single person by ID
router.get('/:id', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id, {
      include: [
        {
          model: Person,
          as: 'parents',
          through: { 
            attributes: [],
            where: { type: 'parent-child' }
          }
        },
        {
          model: Person,
          as: 'spouses',
          through: { 
            attributes: [],
            where: { type: 'spouse' }
          }
        },
        {
          model: Person,
          as: 'children',
          through: { 
            attributes: [],
            where: { type: 'parent-child' }
          }
        }
      ]
    });
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new person
router.post('/', async (req, res) => {
  try {
    const person = await Person.create({
      name: req.body.name,
      gender: req.body.gender,
      dob: req.body.dob || null,
      photo: req.body.photo || null,
      generation: req.body.generation || 0
    });

    const parents = req.body.parents || [];
    const spouses = req.body.spouse || [];
    const children = req.body.children || [];

    // Add parent-child relationships
    if (parents.length > 0) {
      await person.calculateGeneration();
      await person.save();
      
      for (const parentId of parents) {
        await PersonRelationship.create({
          parentId: parentId,
          childId: person.id,
          type: 'parent-child'
        });
      }
    }

    // Add spouse relationships (bidirectional)
    if (spouses.length > 0) {
      for (const spouseId of spouses) {
        await PersonRelationship.findOrCreate({
          where: {
            parentId: person.id,
            childId: spouseId,
            type: 'spouse'
          }
        });
      }
    }

    // Add children relationships
    if (children.length > 0) {
      for (const childId of children) {
        await PersonRelationship.create({
          parentId: person.id,
          childId: childId,
          type: 'parent-child'
        });
      }
    }

    const populatedPerson = await Person.findByPk(person.id, {
      include: [
        { model: Person, as: 'parents', through: { attributes: [] } },
        { model: Person, as: 'spouses', through: { attributes: [] } },
        { model: Person, as: 'children', through: { attributes: [] } }
      ]
    });

    res.status(201).json(populatedPerson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update person
router.put('/:id', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Update basic fields
    if (req.body.name !== undefined) person.name = req.body.name;
    if (req.body.gender !== undefined) person.gender = req.body.gender;
    if (req.body.dob !== undefined) person.dob = req.body.dob;
    if (req.body.photo !== undefined) person.photo = req.body.photo;

    // Update relationships if provided
    if (req.body.parents !== undefined) {
      // Remove old parent relationships
      await PersonRelationship.destroy({
        where: {
          childId: person.id,
          type: 'parent-child'
        }
      });
      
      // Add new parent relationships
      for (const parentId of req.body.parents) {
        await PersonRelationship.create({
          parentId: parentId,
          childId: person.id,
          type: 'parent-child'
        });
      }
      
      // Recalculate generation
      await person.calculateGeneration();
    }

    if (req.body.spouse !== undefined) {
      // Remove old spouse relationships
      await PersonRelationship.destroy({
        where: {
          [Op.or]: [
            { parentId: person.id, type: 'spouse' },
            { childId: person.id, type: 'spouse' }
          ]
        }
      });
      
      // Add new spouse relationships
      for (const spouseId of req.body.spouse) {
        await PersonRelationship.findOrCreate({
          where: {
            parentId: person.id,
            childId: spouseId,
            type: 'spouse'
          }
        });
      }
    }

    if (req.body.children !== undefined) {
      // Remove old children relationships
      await PersonRelationship.destroy({
        where: {
          parentId: person.id,
          type: 'parent-child'
        }
      });
      
      // Add new children relationships
      for (const childId of req.body.children) {
        await PersonRelationship.create({
          parentId: person.id,
          childId: childId,
          type: 'parent-child'
        });
      }
    }

    await person.save();

    const updatedPerson = await Person.findByPk(person.id, {
      include: [
        { model: Person, as: 'parents', through: { attributes: [] } },
        { model: Person, as: 'spouses', through: { attributes: [] } },
        { model: Person, as: 'children', through: { attributes: [] } }
      ]
    });

    res.json(updatedPerson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE person
router.delete('/:id', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id, {
      include: [{ model: Person, as: 'children', through: { attributes: [] } }]
    });
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Check if person has children - prevent deletion if they do
    if (person.children && person.children.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete person with children. Please reassign or delete children first.' 
      });
    }

    // Remove all relationships for this person
    await PersonRelationship.destroy({
      where: {
        [Op.or]: [
          { parentId: person.id },
          { childId: person.id }
        ]
      }
    });

    await person.destroy();
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET family tree structure (optimized for 3D rendering)
router.get('/tree/structure', async (req, res) => {
  try {
    const persons = await Person.findAll({
      include: [
        {
          model: Person,
          as: 'parents',
          attributes: ['id', 'name', 'gender', 'generation'],
          through: { attributes: [] }
        },
        {
          model: Person,
          as: 'spouses',
          attributes: ['id', 'name', 'gender', 'generation'],
          through: { attributes: [] }
        },
        {
          model: Person,
          as: 'children',
          attributes: ['id', 'name', 'gender', 'generation'],
          through: { attributes: [] }
        }
      ]
    });

    // Build nodes and edges for 3D visualization
    const nodes = persons.map(p => ({
      id: p.id,
      name: p.name,
      gender: p.gender,
      dob: p.dob,
      photo: p.photo,
      generation: p.generation,
      position: p.position
    }));

    const edges = [];
    persons.forEach(p => {
      // Parent-child edges
      if (p.parents) {
        p.parents.forEach(parent => {
          edges.push({
            source: parent.id,
            target: p.id,
            type: 'parent-child'
          });
        });
      }

      // Spouse edges (only add once per relationship)
      if (p.spouses) {
        p.spouses.forEach(spouse => {
          const edgeExists = edges.some(e => 
            (e.source === spouse.id && e.target === p.id) ||
            (e.target === spouse.id && e.source === p.id)
          );
          if (!edgeExists) {
            edges.push({
              source: p.id,
              target: spouse.id,
              type: 'spouse'
            });
          }
        });
      }
    });

    res.json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST search persons by name
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    const persons = await Person.findAll({
      where: {
        name: {
          [Op.iLike]: `%${query}%`
        }
      },
      limit: 10
    });
    res.json(persons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
