/**
 * 2D Family Tree Layout Engine - Enhanced with Time-Based Positioning
 * Calculates positions for a hierarchical family tree layout with temporal awareness
 */

export const calculateTreeLayout2D = (persons) => {
  if (!persons || persons.length === 0) {
    return { nodes: [], edges: [], timeScale: null };
  }

  // Enhanced configuration for improved spacing and clarity
  const config = {
    horizontalSpacing: 400,      // Increased horizontal spacing between siblings
    verticalSpacing: 350,        // Increased vertical spacing between generations
    timeBasedVerticalScale: 8,   // Pixels per year for time-based positioning
    nodeWidth: 280,
    nodeHeight: 220,
    siblingGap: 120,             // Gap between siblings
    spouseGap: 80,               // Gap between spouse pairs
    generationBandHeight: 400,   // Height of each generation band
    minVerticalGap: 200,         // Minimum vertical gap between nodes
  };

  // Extract birth years and calculate time scale
  const birthYears = persons
    .filter(p => p.dob)
    .map(p => new Date(p.dob).getFullYear());
  
  const minYear = birthYears.length > 0 ? Math.min(...birthYears) : 1940;
  const maxYear = birthYears.length > 0 ? Math.max(...birthYears) : new Date().getFullYear();
  const yearRange = maxYear - minYear;

  const timeScale = {
    minYear,
    maxYear,
    yearRange,
    scale: config.timeBasedVerticalScale,
  };

  // Group persons by generation
  const generations = {};
  persons.forEach(person => {
    const gen = person.generation || 0;
    if (!generations[gen]) {
      generations[gen] = [];
    }
    generations[gen].push(person);
  });

  // Sort each generation by birth year for better temporal alignment
  Object.keys(generations).forEach(gen => {
    generations[gen].sort((a, b) => {
      const yearA = a.dob ? new Date(a.dob).getFullYear() : 0;
      const yearB = b.dob ? new Date(b.dob).getFullYear() : 0;
      return yearA - yearB;
    });
  });

  // Group families for better alignment
  const familyGroups = groupIntoFamilies(persons, generations);
  
  // Calculate positions with family-aware and time-based layout
  const nodes = [];
  const edges = [];
  const positionedNodes = new Map();

  // Sort generations
  const sortedGens = Object.keys(generations).sort((a, b) => a - b);

  // Calculate generation base Y positions (using generation bands)
  const generationBaseY = {};
  sortedGens.forEach((gen, genIndex) => {
    generationBaseY[gen] = genIndex * config.generationBandHeight;
  });

  sortedGens.forEach((gen) => {
    const generationPersons = generations[gen];
    const baseY = generationBaseY[gen];
    
    // Build family clusters for this generation
    const clusters = buildFamilyClusters(generationPersons, familyGroups, gen);
    
    // Calculate horizontal positions for clusters
    let currentX = 0;
    const clusterPositions = [];
    
    clusters.forEach((cluster, clusterIndex) => {
      const clusterWidth = (cluster.length - 1) * config.horizontalSpacing;
      clusterPositions.push({
        cluster,
        startX: currentX,
        centerX: currentX + clusterWidth / 2,
      });
      currentX += clusterWidth + config.siblingGap * 2; // Extra gap between families
    });

    // Center all clusters
    const totalWidth = currentX - config.siblingGap * 2;
    const offsetX = -totalWidth / 2;

    // Position nodes with time-based vertical adjustment
    clusterPositions.forEach(({ cluster, startX }) => {
      cluster.forEach((person, index) => {
        let x = offsetX + startX + (index * config.horizontalSpacing);
        
        // Calculate Y position based on birth year (time-based)
        let y = baseY;
        if (person.dob) {
          const birthYear = new Date(person.dob).getFullYear();
          const yearOffset = (birthYear - minYear) * config.timeBasedVerticalScale;
          y = baseY + yearOffset;
        }

        // Try to align with parents horizontally
        const parents = person.parents || [];
        if (parents.length > 0) {
          const parentPositions = parents
            .map(p => positionedNodes.get(p.id))
            .filter(pos => pos);
          
          if (parentPositions.length > 0) {
            const avgParentX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length;
            // Blend between cluster position and parent position
            x = x * 0.3 + avgParentX * 0.7; // Favor parent alignment
          }
        }
        
        // Handle spouse positioning - keep them side by side
        const spouses = person.spouses || [];
        if (spouses.length > 0) {
          spouses.forEach(spouse => {
            if (spouse.generation === parseInt(gen) && !positionedNodes.has(spouse.id)) {
              // Position spouse directly next to this person
              const spouseX = x + config.nodeWidth + config.spouseGap;
              
              // Use same Y or average birth years for alignment
              let spouseY = y;
              if (spouse.dob && person.dob) {
                const spouseBirthYear = new Date(spouse.dob).getFullYear();
                const personBirthYear = new Date(person.dob).getFullYear();
                const avgBirthYear = (spouseBirthYear + personBirthYear) / 2;
                const yearOffset = (avgBirthYear - minYear) * config.timeBasedVerticalScale;
                spouseY = baseY + yearOffset;
              }
              
              positionedNodes.set(spouse.id, { x: spouseX, y: spouseY });
              nodes.push({
                ...spouse,
                x: spouseX,
                y: spouseY,
              });
            }
          });
        }
        
        positionedNodes.set(person.id, { x, y });
        nodes.push({
          ...person,
          x,
          y,
        });
      });
    });
  });

  // Create edges for relationships
  persons.forEach(person => {
    // Parent-child edges
    if (person.children && person.children.length > 0) {
      person.children.forEach(child => {
        edges.push({
          source: person.id,
          target: child.id,
          type: 'parent-child',
        });
      });
    }

    // Spouse edges
    if (person.spouses && person.spouses.length > 0) {
      person.spouses.forEach(spouse => {
        // Only add edge once (from lower ID to higher ID)
        if (person.id < spouse.id) {
          edges.push({
            source: person.id,
            target: spouse.id,
            type: 'spouse',
          });
        }
      });
    }
  });

  // Apply collision detection and spacing adjustments
  const adjustedNodes = applyCollisionDetection(nodes, edges, config);

  return {
    nodes: adjustedNodes,
    edges,
    timeScale,
    generationBands: sortedGens.map(gen => ({
      generation: parseInt(gen),
      y: generationBaseY[gen],
      height: config.generationBandHeight,
    })),
  };
};

/**
 * Build family clusters for a generation
 * Groups persons who are married together into clusters
 */
const buildFamilyClusters = (generationPersons, familyGroups, gen) => {
  const clusters = [];
  const processed = new Set();

  // First, add family pairs (spouse clusters)
  familyGroups.forEach(family => {
    const familyMembersInGen = family.members.filter(
      m => m.generation === parseInt(gen)
    );
    
    if (familyMembersInGen.length > 0) {
      const cluster = [];
      familyMembersInGen.forEach(member => {
        if (!processed.has(member.id)) {
          cluster.push(member);
          processed.add(member.id);
        }
      });
      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    }
  });

  // Then add single persons
  generationPersons.forEach(person => {
    if (!processed.has(person.id)) {
      clusters.push([person]);
      processed.add(person.id);
    }
  });

  return clusters;
};

/**
 * Group persons into family units
 */
const groupIntoFamilies = (persons, generations) => {
  const families = [];
  const processed = new Set();

  persons.forEach(person => {
    if (processed.has(person.id)) return;

    // Check if person has spouse(s)
    if (person.spouses && person.spouses.length > 0) {
      const family = {
        members: [person],
        generation: person.generation,
      };

      person.spouses.forEach(spouse => {
        if (!processed.has(spouse.id)) {
          family.members.push(spouse);
          processed.add(spouse.id);
        }
      });

      processed.add(person.id);
      families.push(family);
    }
  });

  return families;
};

/**
 * Apply collision detection and spacing adjustments to prevent overlaps
 */
const applyCollisionDetection = (nodes, edges, config) => {
  let adjustedNodes = nodes.map(node => ({ ...node }));
  const iterations = 3; // Multiple passes for better results
  
  for (let iter = 0; iter < iterations; iter++) {
    // Group nodes by approximate Y position for efficient collision detection
    const yBands = {};
    const bandSize = config.nodeHeight;
    
    adjustedNodes.forEach(node => {
      const bandIndex = Math.floor(node.y / bandSize);
      if (!yBands[bandIndex]) {
        yBands[bandIndex] = [];
      }
      yBands[bandIndex].push(node);
    });

    // Check collisions within and between adjacent bands
    Object.keys(yBands).forEach(bandIndex => {
      const band = yBands[bandIndex];
      const adjacentBand = yBands[parseInt(bandIndex) + 1] || [];
      const checkNodes = [...band, ...adjacentBand];

      // Sort by x position for efficient horizontal collision detection
      band.sort((a, b) => a.x - b.x);

      // Detect and resolve collisions
      for (let i = 0; i < band.length; i++) {
        for (let j = 0; j < checkNodes.length; j++) {
          const nodeA = band[i];
          const nodeB = checkNodes[j];

          if (nodeA.id === nodeB.id) continue;

          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const minDistance = Math.sqrt(
            Math.pow(config.nodeWidth + config.siblingGap, 2) + 
            Math.pow(config.minVerticalGap, 2)
          );

          if (distance < minDistance && distance > 0) {
            // Push nodes apart
            const overlap = minDistance - distance;
            const pushX = (dx / distance) * overlap * 0.5;
            const pushY = (dy / distance) * overlap * 0.3; // Less vertical push

            nodeA.x -= pushX;
            nodeB.x += pushX;
            
            // Only push vertically if not in different generations
            if (Math.abs(dy) < config.generationBandHeight * 0.8) {
              nodeA.y -= pushY;
              nodeB.y += pushY;
            }
          }
        }
      }
    });

    // Apply minimum horizontal spacing within each generation
    const byGeneration = {};
    adjustedNodes.forEach(node => {
      if (!byGeneration[node.generation]) {
        byGeneration[node.generation] = [];
      }
      byGeneration[node.generation].push(node);
    });

    Object.values(byGeneration).forEach(genNodes => {
      genNodes.sort((a, b) => a.x - b.x);
      const minSpacing = config.nodeWidth + config.siblingGap;
      
      for (let i = 0; i < genNodes.length - 1; i++) {
        const current = genNodes[i];
        const next = genNodes[i + 1];
        const distance = next.x - current.x;
        
        if (distance < minSpacing) {
          const overlap = minSpacing - distance;
          current.x -= overlap / 2;
          next.x += overlap / 2;
        }
      }
    });
  }

  return adjustedNodes;
};

/**
 * Calculate layout for filtered view (ancestors or descendants)
 */
export const calculateFilteredLayout = (persons, rootPersonId, mode) => {
  if (!persons || persons.length === 0) {
    return { nodes: [], edges: [] };
  }

  let filteredPersons = [];
  
  if (mode === 'ancestors') {
    filteredPersons = getAncestors(persons, rootPersonId);
  } else if (mode === 'descendants') {
    filteredPersons = getDescendants(persons, rootPersonId);
  } else {
    filteredPersons = persons;
  }

  return calculateTreeLayout2D(filteredPersons);
};

/**
 * Get all ancestors of a person
 */
const getAncestors = (persons, personId) => {
  const ancestors = new Set();
  const queue = [personId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const person = persons.find(p => p.id === currentId);
    
    if (person && !ancestors.has(currentId)) {
      ancestors.add(currentId);
      
      if (person.parents) {
        person.parents.forEach(parent => {
          if (!ancestors.has(parent.id)) {
            queue.push(parent.id);
          }
        });
      }
    }
  }

  return persons.filter(p => ancestors.has(p.id));
};

/**
 * Get all descendants of a person
 */
const getDescendants = (persons, personId) => {
  const descendants = new Set();
  const queue = [personId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const person = persons.find(p => p.id === currentId);
    
    if (person && !descendants.has(currentId)) {
      descendants.add(currentId);
      
      if (person.children) {
        person.children.forEach(child => {
          if (!descendants.has(child.id)) {
            queue.push(child.id);
          }
        });
      }
    }
  }

  return persons.filter(p => descendants.has(p.id));
};
