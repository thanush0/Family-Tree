/**
 * Family Tree Layout Engine
 * Calculates 3D positions for family tree nodes
 */

export class LayoutEngine {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.positions = new Map();
    this.generations = new Map();
    this.spacing = {
      horizontal: 8,  // Increased for better visibility
      vertical: 5,    // Better vertical spacing
      depth: 0        // Flatten Z-axis for clarity
    };
  }

  /**
   * Calculate positions for all nodes
   */
  calculateLayout() {
    // Group nodes by generation
    this.groupByGeneration();

    // Calculate positions for each generation
    this.generations.forEach((generationNodes, generation) => {
      this.positionGeneration(generation, generationNodes);
    });

    return this.positions;
  }

  /**
   * Group nodes by generation
   */
  groupByGeneration() {
    this.nodes.forEach(node => {
      const gen = node.generation || 0;
      if (!this.generations.has(gen)) {
        this.generations.set(gen, []);
      }
      this.generations.get(gen).push(node);
    });
  }

  /**
   * Position nodes in a specific generation
   * Y axis is inverted (higher generation = lower Y)
   */
  positionGeneration(generation, nodes) {
    const count = nodes.length;
    const totalWidth = (count - 1) * this.spacing.horizontal;
    const startX = -totalWidth / 2;

    nodes.forEach((node, index) => {
      const x = startX + (index * this.spacing.horizontal);
      const y = -generation * this.spacing.vertical; // Negative for top-to-bottom view
      const z = 0;

      this.positions.set(node.id, { x, y, z });
    });
  }

  /**
   * Get position for a specific node
   */
  getPosition(nodeId) {
    return this.positions.get(nodeId) || { x: 0, y: 0, z: 0 };
  }

  /**
   * Calculate positions with family grouping
   * Groups spouses and their children together
   */
  calculateFamilyLayout() {
    this.groupByGeneration();
    const families = this.identifyFamilies();

    let currentX = 0;
    const generationYPositions = new Map();

    // Position each family group
    families.forEach((family, familyIndex) => {
      const familyWidth = this.positionFamily(family, currentX, generationYPositions);
      currentX += familyWidth + this.spacing.horizontal * 2;
    });

    // Position unattached nodes
    this.positionUnattachedNodes(currentX, generationYPositions);

    return this.positions;
  }

  /**
   * Identify family units (spouse pairs and their children)
   */
  identifyFamilies() {
    const families = [];
    const processedNodes = new Set();

    // Find spouse relationships
    this.edges
      .filter(e => e.type === 'spouse')
      .forEach(edge => {
        if (!processedNodes.has(edge.source) && !processedNodes.has(edge.target)) {
          const spouse1 = this.nodes.find(n => n.id === edge.source);
          const spouse2 = this.nodes.find(n => n.id === edge.target);

          if (spouse1 && spouse2) {
            // Find their children
            const children = this.edges
              .filter(e => e.type === 'parent-child' && 
                      (e.source === spouse1.id || e.source === spouse2.id))
              .map(e => this.nodes.find(n => n.id === e.target))
              .filter(n => n);

            families.push({
              parents: [spouse1, spouse2],
              children: children
            });

            processedNodes.add(spouse1.id);
            processedNodes.add(spouse2.id);
            children.forEach(c => processedNodes.add(c.id));
          }
        }
      });

    return families;
  }

  /**
   * Position a single family group
   * Improved spacing for 3D view
   */
  positionFamily(family, startX, generationYPositions) {
    const { parents, children } = family;
    
    // Position parents side by side with better spacing
    parents.forEach((parent, index) => {
      const x = startX + (index * this.spacing.horizontal * 0.7); // Closer together
      const y = -parent.generation * this.spacing.vertical; // Negative for top-to-bottom
      
      this.positions.set(parent.id, { x, y, z: 0 });
      
      if (!generationYPositions.has(parent.generation)) {
        generationYPositions.set(parent.generation, y);
      }
    });

    // Position children below parents with better spread
    const childrenCount = children.length;
    const childrenWidth = (childrenCount - 1) * this.spacing.horizontal;
    const parentsCenterX = startX + (parents.length > 1 ? this.spacing.horizontal * 0.35 : 0);
    const childrenStartX = parentsCenterX - childrenWidth / 2;

    children.forEach((child, index) => {
      const x = childrenStartX + (index * this.spacing.horizontal);
      const y = -child.generation * this.spacing.vertical; // Negative for top-to-bottom
      
      this.positions.set(child.id, { x, y, z: 0 });
      
      if (!generationYPositions.has(child.generation)) {
        generationYPositions.set(child.generation, y);
      }
    });

    return Math.max(this.spacing.horizontal * 2.5, childrenWidth + this.spacing.horizontal);
  }

  /**
   * Position nodes not part of any family unit
   */
  positionUnattachedNodes(startX, generationYPositions) {
    const positionedIds = new Set(this.positions.keys());
    
    this.nodes
      .filter(node => !positionedIds.has(node.id))
      .forEach((node, index) => {
        const x = startX + (index * this.spacing.horizontal);
        const y = generationYPositions.get(node.generation) || 
                  (-node.generation * this.spacing.vertical); // Negative for top-to-bottom
        
        this.positions.set(node.id, { x, y, z: 0 });
      });
  }
}

/**
 * Calculate layout for the family tree
 */
export const calculateTreeLayout = (nodes, edges) => {
  const engine = new LayoutEngine(nodes, edges);
  return engine.calculateFamilyLayout();
};
