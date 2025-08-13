'use client';

import { useState } from 'react';
import { Evidence } from '@/types';
import { useDrop } from 'react-dnd';
import { Pin, Trash2, Link } from 'lucide-react';

interface EvidenceBoardProps {
  evidence: Evidence[];
}

interface DroppedEvidence extends Evidence {
  x: number;
  y: number;
  connections?: string[];
}

export function EvidenceBoard({ evidence }: EvidenceBoardProps) {
  const [pinnedEvidence, setPinnedEvidence] = useState<DroppedEvidence[]>([]);
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([]);
  const [selectedForConnection, setSelectedForConnection] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'evidence',
    drop: (item: { id: string; evidence: Evidence }, monitor) => {
      const offset = monitor.getDropResult();
      const clientOffset = monitor.getClientOffset();
      
      if (clientOffset) {
        const boardRect = document.getElementById('evidence-board')?.getBoundingClientRect();
        if (boardRect) {
          const x = clientOffset.x - boardRect.left;
          const y = clientOffset.y - boardRect.top;
          
          // Check if evidence is already pinned
          if (!pinnedEvidence.find(e => e.id === item.id)) {
            setPinnedEvidence(prev => [...prev, {
              ...item.evidence,
              x: Math.max(0, Math.min(x - 50, boardRect.width - 100)), // Keep within bounds
              y: Math.max(0, Math.min(y - 25, boardRect.height - 50))
            }]);
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  const handleRemoveEvidence = (evidenceId: string) => {
    setPinnedEvidence(prev => prev.filter(e => e.id !== evidenceId));
    setConnections(prev => prev.filter(c => c.from !== evidenceId && c.to !== evidenceId));
  };

  const handleConnectEvidence = (evidenceId: string) => {
    if (selectedForConnection === null) {
      setSelectedForConnection(evidenceId);
    } else if (selectedForConnection !== evidenceId) {
      const newConnection = { from: selectedForConnection, to: evidenceId };
      const reverseConnection = { from: evidenceId, to: selectedForConnection };
      
      // Check if connection already exists
      if (!connections.some(c => 
        (c.from === newConnection.from && c.to === newConnection.to) ||
        (c.from === reverseConnection.from && c.to === reverseConnection.to)
      )) {
        setConnections(prev => [...prev, newConnection]);
      }
      setSelectedForConnection(null);
    } else {
      setSelectedForConnection(null);
    }
  };

  const renderConnections = () => {
    return connections.map((connection, index) => {
      const fromEvidence = pinnedEvidence.find(e => e.id === connection.from);
      const toEvidence = pinnedEvidence.find(e => e.id === connection.to);
      
      if (!fromEvidence || !toEvidence) return null;
      
      const fromX = fromEvidence.x + 50; // Center of evidence card
      const fromY = fromEvidence.y + 25;
      const toX = toEvidence.x + 50;
      const toY = toEvidence.y + 25;
      
      return (
        <line
          key={index}
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="#8B4513"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      );
    });
  };

  return (
    <div className="relative">
      <div
        id="evidence-board"
        ref={drop as any}
        className={`cork-board relative w-full h-96 rounded-lg border-4 border-detective-brown overflow-hidden ${
          isOver ? 'ring-4 ring-detective-gold ring-opacity-50' : ''
        }`}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139,69,19,0.3) 1px, transparent 0)',
                 backgroundSize: '20px 20px'
               }}
          />
        </div>
        
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {renderConnections()}
        </svg>
        
        {/* Pinned Evidence */}
        {pinnedEvidence.map((evidence) => (
          <div
            key={evidence.id}
            className={`absolute bg-yellow-100 border-2 border-yellow-300 rounded p-2 shadow-lg max-w-48 cursor-move ${
              selectedForConnection === evidence.id ? 'ring-2 ring-detective-gold' : ''
            }`}
            style={{
              left: evidence.x,
              top: evidence.y,
              transform: 'rotate(-1deg)',
              zIndex: 10
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <h5 className="font-bold text-xs text-detective-dark line-clamp-2">
                {evidence.title}
              </h5>
              <Pin size={12} className="text-detective-brown flex-shrink-0 ml-1" />
            </div>
            
            <p className="text-xs text-detective-brown line-clamp-3 mb-2">
              {evidence.content.substring(0, 100)}...
            </p>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleConnectEvidence(evidence.id)}
                className={`p-1 rounded text-xs transition-colors ${
                  selectedForConnection === evidence.id
                    ? 'bg-detective-gold text-detective-dark'
                    : 'bg-detective-brown text-white hover:bg-detective-dark'
                }`}
                title="Connect to other evidence"
              >
                <Link size={10} />
              </button>
              
              <button
                onClick={() => handleRemoveEvidence(evidence.id)}
                className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                title="Remove from board"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Drop Instruction */}
        {pinnedEvidence.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-detective-brown/60">
              <Pin size={48} className="mx-auto mb-2" />
              <p className="text-lg font-medium">Investigation Board</p>
              <p className="text-sm">Drag evidence here to organize and connect clues</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Board Controls */}
      <div className="flex items-center justify-between mt-4 text-sm text-detective-brown">
        <div className="flex items-center gap-4">
          <span>{pinnedEvidence.length} items pinned</span>
          <span>{connections.length} connections made</span>
        </div>
        
        {selectedForConnection && (
          <div className="text-detective-gold font-medium">
            Select another evidence item to create a connection
          </div>
        )}
        
        <button
          onClick={() => {
            setPinnedEvidence([]);
            setConnections([]);
            setSelectedForConnection(null);
          }}
          className="text-detective-red hover:underline"
        >
          Clear Board
        </button>
      </div>
    </div>
  );
}