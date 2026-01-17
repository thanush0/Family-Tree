import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls as FlowControls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import PersonNode2D from './PersonNode2D';
import TimelineScale from './TimelineScale';
import GenerationBands from './GenerationBands';
import { calculateTreeLayout2D } from '../utils/layoutEngine2D';

const nodeTypes = {
  person: PersonNode2D,
};

function FamilyTree2D({ persons, selectedPerson, onPersonSelect, viewMode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [timeScale, setTimeScale] = useState(null);
  const [generationBands, setGenerationBands] = useState([]);
  const [highlightedConnections, setHighlightedConnections] = useState({
    nodes: new Set(),
    edges: new Set(),
    relationshipTypes: {}
  });

  // Convert persons data to nodes and edges
  useEffect(() => {
    if (!persons || persons.length === 0) return;

    // Calculate layout positions with time-based positioning
    const { 
      nodes: layoutNodes, 
      edges: layoutEdges, 
      timeScale: calcTimeScale,
      generationBands: calcBands 
    } = calculateTreeLayout2D(persons);
    
    setTimeScale(calcTimeScale);
    setGenerationBands(calcBands);

    // Create nodes with highlight information
    const flowNodes = layoutNodes.map((person) => ({
      id: person.id,
      type: 'person',
      position: { x: person.x, y: person.y },
      data: {
        person: person,
        isSelected: selectedPerson === person.id,
        onSelect: () => onPersonSelect(person.id),
        isHighlighted: highlightedConnections.nodes.has(person.id),
        relationshipType: highlightedConnections.relationshipTypes[person.id],
      },
      draggable: false, // Make cards static
      selectable: true,
      connectable: false,
    }));

    // Create edges with improved routing and styling
    const flowEdges = layoutEdges.map((edge, index) => {
      const sourcePerson = persons.find(p => p.id === edge.source);
      const targetPerson = persons.find(p => p.id === edge.target);
      
      // Check if this edge is highlighted
      const edgeKey = `${edge.source}-${edge.target}`;
      const isEdgeHighlighted = highlightedConnections.edges.has(edgeKey);
      
      let relationLabel = '';
      let labelBg = 'rgba(0, 0, 0, 0.7)';
      let edgeColor = '#3b82f6';
      let strokeWidth = 3;
      let edgeType = 'smoothstep';
      
      if (edge.type === 'sibling') {
        relationLabel = '👥 Siblings';
        edgeColor = isEdgeHighlighted ? '#f59e0b' : '#f59e0b';
        labelBg = 'rgba(245, 158, 11, 0.9)';
        strokeWidth = isEdgeHighlighted ? 5 : 3;
        edgeType = 'straight'; // Straight line for sibling connections
      } else if (edge.type === 'spouse') {
        relationLabel = '💑 Married';
        edgeColor = isEdgeHighlighted ? '#a855f7' : '#a855f7';
        labelBg = 'rgba(168, 85, 247, 0.9)';
        strokeWidth = isEdgeHighlighted ? 5 : 4;
        edgeType = 'straight'; // Straight line for spouse connections
      } else {
        // Parent-child relationship - use smoothstep for better curved routing
        const genDiff = targetPerson?.generation - sourcePerson?.generation;
        
        // Determine highlight color based on relationship type
        if (isEdgeHighlighted) {
          // If source is selected, target is child (cyan)
          // If target is selected, source is parent (green)
          if (highlightedConnections.relationshipTypes[edge.target] === 'child') {
            edgeColor = '#06b6d4'; // Cyan for child connections
            labelBg = 'rgba(6, 182, 212, 0.9)';
          } else if (highlightedConnections.relationshipTypes[edge.source] === 'parent') {
            edgeColor = '#10b981'; // Green for parent connections
            labelBg = 'rgba(16, 185, 129, 0.9)';
          } else {
            edgeColor = '#3b82f6'; // Default blue
            labelBg = 'rgba(59, 130, 246, 0.9)';
          }
          strokeWidth = 5; // Thicker when highlighted
        } else {
          // Default colors when not highlighted
          if (genDiff === 1) {
            edgeColor = '#3b82f6';
            labelBg = 'rgba(59, 130, 246, 0.9)';
          } else if (genDiff === 2) {
            edgeColor = '#10b981';
            labelBg = 'rgba(16, 185, 129, 0.9)';
          } else {
            edgeColor = '#6366f1';
            labelBg = 'rgba(99, 102, 241, 0.9)';
          }
          strokeWidth = 3;
        }
        
        if (genDiff === 1) {
          relationLabel = '👨‍👧 Parent → Child';
        } else if (genDiff === 2) {
          relationLabel = '👴 Grandparent → Grandchild';
        } else {
          relationLabel = '👪 Family';
        }
        
        edgeType = 'smoothstep'; // Use smoothstep for smooth curved routing
      }
      
      // Configure handles for spouse connections
      const edgeConfig = {
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: edgeType,
        animated: isEdgeHighlighted || edge.type !== 'spouse', // Animate highlighted edges
        style: {
          stroke: edgeColor,
          strokeWidth: strokeWidth,
          strokeDasharray: edge.type === 'spouse' ? '8, 8' : '0',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          opacity: isEdgeHighlighted ? 1 : (selectedPerson ? 0.3 : 1), // Fade non-highlighted edges
          transition: 'all 0.3s ease',
        },
        zIndex: isEdgeHighlighted ? 10 : 1, // Highlighted edges on top
        markerEnd: edge.type === 'spouse' ? undefined : {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
          width: 20,
          height: 20,
        },
        label: relationLabel,
        labelStyle: { 
          fontSize: 11,
          fontWeight: 'bold',
          fill: 'white',
          padding: '6px 10px',
        },
        labelBgStyle: {
          fill: labelBg,
          fillOpacity: 0.95,
        },
        labelBgPadding: [6, 10],
        labelBgBorderRadius: 6,
      };
      
      // Use side handles for spouse connections for better horizontal alignment
      if (edge.type === 'spouse') {
        edgeConfig.sourceHandle = 'spouse-right';
        edgeConfig.targetHandle = 'spouse-left';
      }
      
      return edgeConfig;
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [persons, selectedPerson, onPersonSelect, setNodes, setEdges]);

  // Update selected person and highlighted connections
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: selectedPerson === node.id,
          isHighlighted: highlightedConnections.nodes.has(node.id),
          relationshipType: highlightedConnections.relationshipTypes[node.id],
        },
      }))
    );
  }, [selectedPerson, highlightedConnections, setNodes]);

  // Calculate highlighted connections when a person is selected
  useEffect(() => {
    if (!selectedPerson || !persons || persons.length === 0) {
      setHighlightedConnections({ nodes: new Set(), edges: new Set(), relationshipTypes: {} });
      return;
    }

    const person = persons.find(p => p.id === selectedPerson);
    if (!person) return;

    const highlightedNodes = new Set([selectedPerson]);
    const highlightedEdges = new Set();
    const relationshipTypes = {};

    // Add parents and their connections
    if (person.parents) {
      person.parents.forEach(parent => {
        const parentId = parent.id || parent;
        highlightedNodes.add(parentId);
        relationshipTypes[parentId] = 'parent';
        // Mark edge for highlighting
        highlightedEdges.add(`${parentId}-${selectedPerson}`);
      });
    }

    // Add children and their connections
    if (person.children) {
      person.children.forEach(child => {
        const childId = child.id || child;
        highlightedNodes.add(childId);
        relationshipTypes[childId] = 'child';
        // Mark edge for highlighting
        highlightedEdges.add(`${selectedPerson}-${childId}`);
      });
    }

    // Add spouses and their connections
    if (person.spouses) {
      person.spouses.forEach(spouse => {
        const spouseId = spouse.id || spouse;
        highlightedNodes.add(spouseId);
        relationshipTypes[spouseId] = 'spouse';
        // Mark edge for highlighting (bidirectional for spouse)
        highlightedEdges.add(`${selectedPerson}-${spouseId}`);
        highlightedEdges.add(`${spouseId}-${selectedPerson}`);
      });
    }

    // Add siblings and their connections
    if (person.siblings) {
      person.siblings.forEach(sibling => {
        const siblingId = sibling.id || sibling;
        highlightedNodes.add(siblingId);
        relationshipTypes[siblingId] = 'sibling';
        // Sibling edges are through parents, so mark parent-sibling connections
        highlightedEdges.add(`${siblingId}-${selectedPerson}`);
        highlightedEdges.add(`${selectedPerson}-${siblingId}`);
      });
    }

    setHighlightedConnections({ nodes: highlightedNodes, edges: highlightedEdges, relationshipTypes });
  }, [selectedPerson, persons]);

  const onNodeClick = useCallback(
    (event, node) => {
      if (node.data.onSelect) {
        node.data.onSelect();
      }
    },
    []
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        fitViewOptions={{
          padding: 0.3,
          maxZoom: 1,
          minZoom: 0.5,
        }}
        minZoom={0.05}
        maxZoom={1.5}
        defaultEdgeOptions={{
          animated: false,
        }}
      >
        {/* Generation bands background */}
        <GenerationBands 
          generationBands={generationBands} 
          viewportWidth={12000}
          viewportHeight={8000}
        />
        
        <Background 
          color="#475569" 
          gap={20} 
          size={1}
          style={{ opacity: 0.3 }}
        />
        
        <FlowControls 
          showInteractive={false}
          style={{
            button: {
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              borderColor: '#475569',
            }
          }}
        />
        
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isSelected) return '#fbbf24';
            const gender = node.data.person?.gender;
            if (gender === 'Male') return '#3b82f6';
            if (gender === 'Female') return '#ec4899';
            return '#a855f7';
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
          style={{
            backgroundColor: '#1e293b',
            border: '2px solid #475569',
          }}
        />
        
        {/* Timeline Scale */}
        <TimelineScale 
          timeScale={timeScale} 
          generationBands={generationBands}
        />
        
        {/* Legend Panel */}
        <Panel position="top-right" style={{ 
          background: 'rgba(30, 41, 59, 0.95)', 
          padding: '12px 16px', 
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '14px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Legend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '4px' }}></div>
            <span>Male</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '20px', height: '20px', background: '#ec4899', borderRadius: '4px' }}></div>
            <span>Female</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '20px', height: '20px', background: '#a855f7', borderRadius: '4px' }}></div>
            <span>Other</span>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #475569' }}>
            <div style={{ marginBottom: '4px', fontSize: '12px' }}>
              <span style={{ opacity: 0.8 }}>Edges:</span>
            </div>
            <div style={{ marginBottom: '4px', fontSize: '12px' }}>💑 Spouse (dashed)</div>
            <div style={{ fontSize: '12px' }}>→ Parent-Child</div>
          </div>
          {selectedPerson && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #475569' }}>
              <div style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                <span style={{ opacity: 0.8 }}>Click Highlight:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '11px' }}>
                <div style={{ width: '16px', height: '16px', background: '#10b981', borderRadius: '3px' }}></div>
                <span>Parents</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '11px' }}>
                <div style={{ width: '16px', height: '16px', background: '#06b6d4', borderRadius: '3px' }}></div>
                <span>Children</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '11px' }}>
                <div style={{ width: '16px', height: '16px', background: '#a855f7', borderRadius: '3px' }}></div>
                <span>Spouse</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <div style={{ width: '16px', height: '16px', background: '#f59e0b', borderRadius: '3px' }}></div>
                <span>Siblings</span>
              </div>
            </div>
          )}
        </Panel>
        
        {/* Info Panel */}
        <Panel position="bottom-left" style={{ 
          background: 'rgba(30, 41, 59, 0.95)', 
          padding: '10px 14px', 
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
        }}>
          <div style={{ opacity: 0.8 }}>
            ✨ <strong>Enhanced Layout:</strong> Time-based positioning • Improved spacing • Generation bands
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default FamilyTree2D;
