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

    // Create nodes
    const flowNodes = layoutNodes.map((person) => ({
      id: person.id,
      type: 'person',
      position: { x: person.x, y: person.y },
      data: {
        person: person,
        isSelected: selectedPerson === person.id,
        onSelect: () => onPersonSelect(person.id),
      },
      draggable: true,
    }));

    // Create edges with improved routing and styling
    const flowEdges = layoutEdges.map((edge, index) => {
      const sourcePerson = persons.find(p => p.id === edge.source);
      const targetPerson = persons.find(p => p.id === edge.target);
      
      let relationLabel = '';
      let labelBg = 'rgba(0, 0, 0, 0.7)';
      let edgeColor = '#3b82f6';
      let strokeWidth = 3;
      let edgeType = 'smoothstep';
      
      if (edge.type === 'spouse') {
        relationLabel = '💑 Married';
        edgeColor = '#a855f7';
        labelBg = 'rgba(168, 85, 247, 0.9)';
        strokeWidth = 4;
        edgeType = 'straight'; // Straight line for spouse connections
      } else {
        // Parent-child relationship - use step edge for cleaner routing
        const genDiff = targetPerson?.generation - sourcePerson?.generation;
        if (genDiff === 1) {
          relationLabel = '👨‍👧 Parent → Child';
          edgeColor = '#3b82f6';
          labelBg = 'rgba(59, 130, 246, 0.9)';
        } else if (genDiff === 2) {
          relationLabel = '👴 Grandparent → Grandchild';
          edgeColor = '#10b981';
          labelBg = 'rgba(16, 185, 129, 0.9)';
        } else {
          relationLabel = '👪 Family';
          edgeColor = '#6366f1';
          labelBg = 'rgba(99, 102, 241, 0.9)';
        }
        edgeType = 'step'; // Step edge for better vertical-then-horizontal routing
      }
      
      return {
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: edgeType,
        animated: edge.type !== 'spouse',
        style: {
          stroke: edgeColor,
          strokeWidth: strokeWidth,
          strokeDasharray: edge.type === 'spouse' ? '8, 8' : '0',
          strokeLinecap: 'round',
        },
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
        // Improve edge path routing
        pathOptions: { 
          offset: 20,
          borderRadius: 12,
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [persons, selectedPerson, onPersonSelect, setNodes, setEdges]);

  // Update selected person
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: selectedPerson === node.id,
        },
      }))
    );
  }, [selectedPerson, setNodes]);

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
