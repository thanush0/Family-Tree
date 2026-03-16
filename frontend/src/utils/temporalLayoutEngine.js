/**
 * Temporal 3D Layout Engine for Family Trees
 * 
 * Key Principles:
 * - Y-axis represents TIME (older dates = higher Y position)
 * - Children ALWAYS appear below parents
 * - Events act as structural anchor points
 * - Organic spacing, not rigid grids
 * - Curved, flowing connections
 */

import * as THREE from 'three';

export class TemporalLayoutEngine {
  constructor(persons, events = []) {
    this.persons = persons;
    this.events = events;
    this.positions = new Map();
    this.timeScale = 0.1; // Years to 3D units conversion
    this.horizontalSpacing = 8;
    this.depthVariation = 3; // Z-axis variation for depth
    this.baseYear = null;
    this.maxYear = null;
  }

  /**
   * Calculate temporal positions for all nodes
   */
  calculateTemporalLayout() {
    // Step 1: Determine time range
    this.calculateTimeRange();

    // Step 2: Position people based on their birth dates and relationships
    this.positionPersonsByTime();

    // Step 3: Apply family grouping adjustments
    this.applyFamilyGrouping();

    // Step 4: Add organic depth variation
    this.addDepthVariation();

    // Step 5: Create marriage/event nodes (after person positions are set)
    const eventNodes = this.createEventNodes();

    // Step 6: Position event nodes based on participants
    eventNodes.forEach(event => {
      event.position = this.getEventPosition(event);
    });

    return {
      personPositions: this.positions,
      eventNodes: eventNodes
    };
  }

  /**
   * Calculate the time range from birth dates
   */
  calculateTimeRange() {
    const dates = this.persons
      .map(p => p.dob ? new Date(p.dob).getFullYear() : null)
      .filter(d => d !== null);

    if (dates.length === 0) {
      // Fallback to generation-based layout
      this.baseYear = 2000;
      this.maxYear = 2000;
      return;
    }

    this.baseYear = Math.min(...dates);
    this.maxYear = Math.max(...dates);
  }

  /**
   * Create event nodes for marriages
   */
  createEventNodes() {
    const eventNodes = [];
    const processedPairs = new Set();

    this.persons.forEach(person => {
      if (person.spouses && person.spouses.length > 0) {
        person.spouses.forEach(spouse => {
          const spouseData = this.persons.find(p => p.id === spouse.id || p.id === spouse);
          if (!spouseData) return;

          const pairKey = [person.id, spouseData.id].sort().join('-');
          if (processedPairs.has(pairKey)) return;
          processedPairs.add(pairKey);

          // Calculate marriage date (average of birth dates + typical marriage age)
          let marriageDate;
          const personBirth = person.dob ? new Date(person.dob) : null;
          const spouseBirth = spouseData.dob ? new Date(spouseData.dob) : null;

          if (personBirth && spouseBirth) {
            const avgBirthYear = (personBirth.getFullYear() + spouseBirth.getFullYear()) / 2;
            marriageDate = new Date(avgBirthYear + 25, 0, 1); // Assume marriage at 25
          } else if (personBirth) {
            marriageDate = new Date(personBirth.getFullYear() + 25, 0, 1);
          } else if (spouseBirth) {
            marriageDate = new Date(spouseBirth.getFullYear() + 25, 0, 1);
          } else {
            // Use generation-based estimate
            const avgGen = (person.generation + spouseData.generation) / 2;
            marriageDate = new Date(this.baseYear + avgGen * 25, 0, 1);
          }

          eventNodes.push({
            id: `marriage-${pairKey}`,
            type: 'marriage',
            date: marriageDate,
            participants: [person.id, spouseData.id],
            description: `${person.name} & ${spouseData.name}`
          });
        });
      }
    });

    return eventNodes;
  }

  /**
   * Position persons based on their birth dates
   */
  positionPersonsByTime() {
    // Group persons by generation first for horizontal spacing
    const generationGroups = new Map();
    
    this.persons.forEach(person => {
      const gen = person.generation || 0;
      if (!generationGroups.has(gen)) {
        generationGroups.set(gen, []);
      }
      generationGroups.get(gen).push(person);
    });

    // Position each generation
    generationGroups.forEach((people, generation) => {
      const count = people.length;
      const totalWidth = (count - 1) * this.horizontalSpacing;
      const startX = -totalWidth / 2;

      people.forEach((person, index) => {
        // Y position based on birth date (TIME AXIS)
        let y;
        if (person.dob) {
          const birthYear = new Date(person.dob).getFullYear();
          // Older dates = higher Y (inverted for top-down time flow)
          y = (this.maxYear - birthYear) * this.timeScale;
        } else {
          // Fallback to generation-based positioning
          y = generation * 5;
        }

        // X position based on siblings and family position
        const x = startX + (index * this.horizontalSpacing);
        
        // Z position (depth) - will be adjusted later for organic feel
        const z = 0;

        this.positions.set(person.id, new THREE.Vector3(x, y, z));
      });
    });
  }

  /**
   * Apply family grouping - keep spouses and children close together
   */
  applyFamilyGrouping() {
    const processed = new Set();

    this.persons.forEach(person => {
      if (processed.has(person.id)) return;

      // Find spouse
      if (person.spouses && person.spouses.length > 0) {
        const spouseId = person.spouses[0].id || person.spouses[0];
        const spouse = this.persons.find(p => p.id === spouseId);
        
        if (spouse && !processed.has(spouseId)) {
          const personPos = this.positions.get(person.id);
          const spousePos = this.positions.get(spouseId);

          if (personPos && spousePos) {
            // Move spouses closer together horizontally
            const midX = (personPos.x + spousePos.x) / 2;
            const spacing = this.horizontalSpacing * 0.4;
            
            personPos.x = midX - spacing / 2;
            spousePos.x = midX + spacing / 2;
            
            // Align Y positions (same generation should be at same height)
            const avgY = (personPos.y + spousePos.y) / 2;
            personPos.y = avgY;
            spousePos.y = avgY;

            processed.add(person.id);
            processed.add(spouseId);

            // Position children below parents
            this.positionChildren(person, spouse, midX, avgY);
          }
        }
      }
    });
  }

  /**
   * Position children below their parents
   */
  positionChildren(parent1, parent2, parentX, parentY) {
    const children = new Set();
    
    // Collect all children from both parents
    if (parent1.children) {
      parent1.children.forEach(c => children.add(c.id || c));
    }
    if (parent2.children) {
      parent2.children.forEach(c => children.add(c.id || c));
    }

    const childArray = Array.from(children)
      .map(id => this.persons.find(p => p.id === id))
      .filter(p => p);

    if (childArray.length === 0) return;

    // Arrange children in a fan below parents
    const childCount = childArray.length;
    const fanWidth = Math.min(childCount * this.horizontalSpacing * 0.8, this.horizontalSpacing * 4);
    const startX = parentX - fanWidth / 2;

    childArray.forEach((child, index) => {
      const childPos = this.positions.get(child.id);
      if (childPos) {
        // Adjust X to be centered under parents
        if (childCount === 1) {
          childPos.x = parentX;
        } else {
          childPos.x = startX + (index * fanWidth / (childCount - 1));
        }
        
        // Ensure child is below parents (Y should already be set by birth date)
        // But add a minimum offset if needed
        if (childPos.y <= parentY) {
          childPos.y = parentY + 5; // Ensure children are always below
        }
      }
    });
  }

  /**
   * Add organic depth variation for a more natural, less flat appearance
   */
  addDepthVariation() {
    this.positions.forEach((position, personId) => {
      // Use person ID hash for consistent but varied depth
      const hash = this.hashString(personId);
      const depth = (hash % 100) / 100 * this.depthVariation - this.depthVariation / 2;
      position.z = depth;
    });
  }

  /**
   * Simple string hash function for consistent randomization
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Get position for event node based on its date and participants
   */
  getEventPosition(event) {
    if (event.type === 'marriage' && event.participants) {
      const participant1Pos = this.positions.get(event.participants[0]);
      const participant2Pos = this.positions.get(event.participants[1]);

      if (participant1Pos && participant2Pos) {
        // Position marriage node between spouses, slightly above them
        const midX = (participant1Pos.x + participant2Pos.x) / 2;
        const midY = (participant1Pos.y + participant2Pos.y) / 2 - 1; // Slightly above
        const midZ = (participant1Pos.z + participant2Pos.z) / 2;
        
        return new THREE.Vector3(midX, midY, midZ);
      }
    }

    // Fallback position
    return new THREE.Vector3(0, 0, 0);
  }
}

/**
 * Main export function - calculates temporal layout
 */
export const calculateTemporalLayout = (persons, events = []) => {
  const engine = new TemporalLayoutEngine(persons, events);
  return engine.calculateTemporalLayout();
};
