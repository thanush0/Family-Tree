const express = require('express');
const router = express.Router();
const { Person, PersonRelationship } = require('../models/Person');
const { Op } = require('sequelize');

// Helper function to create complete sibling relationships (all siblings linked to each other)
async function createCompleteSiblingGroup(personId, siblingIds) {
  // Get the person
  const person = await Person.findByPk(personId);
  if (!person) return;
  
  // Collect all siblings including the person and their new siblings
  const allSiblingIds = new Set([personId, ...siblingIds]);
  
  // Get existing siblings of the person
  const existingSiblingRels = await PersonRelationship.findAll({
    where: {
      [Op.or]: [
        { parentId: personId, type: 'sibling' },
        { childId: personId, type: 'sibling' }
      ]
    }
  });
  
  // Add existing siblings to the set
  existingSiblingRels.forEach(rel => {
    const siblingId = rel.parentId === personId ? rel.childId : rel.parentId;
    allSiblingIds.add(siblingId);
  });
  
  // Get existing siblings of each new sibling
  for (const siblingId of siblingIds) {
    const siblingRels = await PersonRelationship.findAll({
      where: {
        [Op.or]: [
          { parentId: siblingId, type: 'sibling' },
          { childId: siblingId, type: 'sibling' }
        ]
      }
    });
    
    siblingRels.forEach(rel => {
      const otherSiblingId = rel.parentId === siblingId ? rel.childId : rel.parentId;
      allSiblingIds.add(otherSiblingId);
    });
  }
  
  // Convert to array
  const allSiblings = Array.from(allSiblingIds);
  
  // Create bidirectional relationships between all siblings
  for (let i = 0; i < allSiblings.length; i++) {
    for (let j = i + 1; j < allSiblings.length; j++) {
      const sibling1 = allSiblings[i];
      const sibling2 = allSiblings[j];
      
      // Create relationship in both directions
      await PersonRelationship.findOrCreate({
        where: {
          parentId: sibling1,
          childId: sibling2,
          type: 'sibling'
        }
      });
      await PersonRelationship.findOrCreate({
        where: {
          parentId: sibling2,
          childId: sibling1,
          type: 'sibling'
        }
      });
    }
  }
  
  console.log(`Created complete sibling group of ${allSiblings.length} siblings`);
}

// Helper function to recalculate all generations from root ancestors
async function recalculateAllGenerations() {
  // Get all persons
  const allPersons = await Person.findAll();
  
  // Find root ancestors (persons with no parents)
  const rootAncestors = [];
  for (const person of allPersons) {
    const parentRelations = await PersonRelationship.findAll({
      where: { childId: person.id, type: 'parent-child' }
    });
    if (parentRelations.length === 0) {
      rootAncestors.push(person);
    }
  }
  
  // Set all root ancestors to generation 0
  for (const root of rootAncestors) {
    root.generation = 0;
    await root.save();
  }
  
  // Now recalculate for all persons (multiple passes to ensure all are calculated)
  let updated = true;
  let passes = 0;
  const maxPasses = 10; // Prevent infinite loops
  
  while (updated && passes < maxPasses) {
    updated = false;
    passes++;
    
    for (const person of allPersons) {
      const oldGen = person.generation;
      await person.calculateGeneration();
      if (person.generation !== oldGen) {
        await person.save();
        updated = true;
      }
    }
  }
  
  console.log(`Generation recalculation completed in ${passes} passes`);
}

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
    
    // Manually fetch siblings for each person (deduplicate)
    for (const person of persons) {
      const siblings = await PersonRelationship.findAll({
        where: {
          [Op.or]: [
            { parentId: person.id, type: 'sibling' },
            { childId: person.id, type: 'sibling' }
          ]
        },
        include: [
          {
            model: Person,
            as: 'Parent',
            attributes: ['id', 'name', 'gender']
          },
          {
            model: Person,
            as: 'Child',
            attributes: ['id', 'name', 'gender']
          }
        ]
      });
      
      // Deduplicate siblings by ID
      const siblingMap = new Map();
      siblings.forEach(rel => {
        const sibling = rel.parentId === person.id ? rel.Child : rel.Parent;
        if (sibling && !siblingMap.has(sibling.id)) {
          siblingMap.set(sibling.id, sibling);
        }
      });
      person.dataValues.siblings = Array.from(siblingMap.values());
    }
    
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
    
    // Manually fetch siblings (deduplicate)
    const siblings = await PersonRelationship.findAll({
      where: {
        [Op.or]: [
          { parentId: person.id, type: 'sibling' },
          { childId: person.id, type: 'sibling' }
        ]
      },
      include: [
        {
          model: Person,
          as: 'Parent',
          attributes: ['id', 'name', 'gender']
        },
        {
          model: Person,
          as: 'Child',
          attributes: ['id', 'name', 'gender']
        }
      ]
    });
    
    // Deduplicate siblings by ID
    const siblingMap = new Map();
    siblings.forEach(rel => {
      const sibling = rel.parentId === person.id ? rel.Child : rel.Parent;
      if (sibling && !siblingMap.has(sibling.id)) {
        siblingMap.set(sibling.id, sibling);
      }
    });
    person.dataValues.siblings = Array.from(siblingMap.values());
    
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
      generation: 0 // Will be calculated based on relationships and birth year
    });

    const parents = req.body.parents || [];
    const spouses = req.body.spouse || [];
    const children = req.body.children || [];
    const siblings = req.body.siblings || [];

    // Add parent-child relationships
    if (parents.length > 0) {
      for (const parentId of parents) {
        await PersonRelationship.create({
          parentId: parentId,
          childId: person.id,
          type: 'parent-child'
        });
      }
    }
    
    // Recalculate generations for entire tree to ensure consistency
    await recalculateAllGenerations();

    // Add spouse relationships (bidirectional)
    if (spouses.length > 0) {
      for (const spouseId of spouses) {
        const spouse = await Person.findByPk(spouseId);
        if (spouse) {
          // Ensure both spouses are in the same generation
          // Use the higher generation value to avoid breaking parent-child relationships
          const targetGeneration = Math.max(person.generation, spouse.generation);
          
          if (person.generation !== targetGeneration) {
            person.generation = targetGeneration;
            await person.save();
          }
          
          if (spouse.generation !== targetGeneration) {
            spouse.generation = targetGeneration;
            await spouse.save();
          }
          
          // Create spouse relationship in both directions
          await PersonRelationship.findOrCreate({
            where: {
              parentId: person.id,
              childId: spouseId,
              type: 'spouse'
            }
          });
          await PersonRelationship.findOrCreate({
            where: {
              parentId: spouseId,
              childId: person.id,
              type: 'spouse'
            }
          });
        }
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
        
        // Update child's generation
        const child = await Person.findByPk(childId);
        if (child) {
          await child.calculateGeneration();
          await child.save();
        }
      }
      
      // Recalculate parent's generation if needed
      await person.calculateGeneration();
      await person.save();
    }

    // Add sibling relationships (complete sibling group)
    if (siblings.length > 0) {
      await createCompleteSiblingGroup(person.id, siblings);
    }

    const populatedPerson = await Person.findByPk(person.id, {
      include: [
        { model: Person, as: 'parents', through: { attributes: [] } },
        { model: Person, as: 'spouses', through: { attributes: [] } },
        { model: Person, as: 'children', through: { attributes: [] } }
      ]
    });

    // Manually fetch siblings (deduplicate)
    const siblingRels = await PersonRelationship.findAll({
      where: {
        [Op.or]: [
          { parentId: person.id, type: 'sibling' },
          { childId: person.id, type: 'sibling' }
        ]
      },
      include: [
        {
          model: Person,
          as: 'Parent',
          attributes: ['id', 'name', 'gender']
        },
        {
          model: Person,
          as: 'Child',
          attributes: ['id', 'name', 'gender']
        }
      ]
    });
    
    // Deduplicate siblings by ID
    const siblingMap = new Map();
    siblingRels.forEach(rel => {
      const sibling = rel.parentId === person.id ? rel.Child : rel.Parent;
      if (sibling && !siblingMap.has(sibling.id)) {
        siblingMap.set(sibling.id, sibling);
      }
    });
    populatedPerson.dataValues.siblings = Array.from(siblingMap.values());

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
    if (req.body.dob !== undefined) person.dob = req.body.dob || null;
    if (req.body.photo !== undefined) person.photo = req.body.photo || null;

    // Save basic fields first
    await person.save();

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
      
      // Add new spouse relationships (bidirectional)
      for (const spouseId of req.body.spouse) {
        const spouse = await Person.findByPk(spouseId);
        if (spouse) {
          // Ensure both spouses are in the same generation
          // Use the higher generation value to avoid breaking parent-child relationships
          const targetGeneration = Math.max(person.generation, spouse.generation);
          
          if (person.generation !== targetGeneration) {
            person.generation = targetGeneration;
            await person.save();
          }
          
          if (spouse.generation !== targetGeneration) {
            spouse.generation = targetGeneration;
            await spouse.save();
          }
          
          await PersonRelationship.findOrCreate({
            where: {
              parentId: person.id,
              childId: spouseId,
              type: 'spouse'
            }
          });
          await PersonRelationship.findOrCreate({
            where: {
              parentId: spouseId,
              childId: person.id,
              type: 'spouse'
            }
          });
        }
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
        
        // Update child's generation
        const child = await Person.findByPk(childId);
        if (child) {
          await child.calculateGeneration();
          await child.save();
        }
      }
    }

    if (req.body.siblings !== undefined) {
      // Remove old sibling relationships for this person
      await PersonRelationship.destroy({
        where: {
          [Op.or]: [
            { parentId: person.id, type: 'sibling' },
            { childId: person.id, type: 'sibling' }
          ]
        }
      });
      
      // Add new sibling relationships (complete sibling group)
      if (req.body.siblings.length > 0) {
        await createCompleteSiblingGroup(person.id, req.body.siblings);
      }
    }

    // Recalculate generations for entire tree to ensure consistency
    await recalculateAllGenerations();

    const updatedPerson = await Person.findByPk(person.id, {
      include: [
        { model: Person, as: 'parents', through: { attributes: [] } },
        { model: Person, as: 'spouses', through: { attributes: [] } },
        { model: Person, as: 'children', through: { attributes: [] } }
      ]
    });

    // Manually fetch siblings (deduplicate)
    const siblingRels = await PersonRelationship.findAll({
      where: {
        [Op.or]: [
          { parentId: person.id, type: 'sibling' },
          { childId: person.id, type: 'sibling' }
        ]
      },
      include: [
        {
          model: Person,
          as: 'Parent',
          attributes: ['id', 'name', 'gender']
        },
        {
          model: Person,
          as: 'Child',
          attributes: ['id', 'name', 'gender']
        }
      ]
    });
    
    // Deduplicate siblings by ID
    const siblingMap = new Map();
    siblingRels.forEach(rel => {
      const sibling = rel.parentId === person.id ? rel.Child : rel.Parent;
      if (sibling && !siblingMap.has(sibling.id)) {
        siblingMap.set(sibling.id, sibling);
      }
    });
    updatedPerson.dataValues.siblings = Array.from(siblingMap.values());

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
