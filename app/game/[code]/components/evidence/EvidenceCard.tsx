'use client';

import { useState } from 'react';
import { Evidence } from '@/types';
import { Clock, MessageSquare, FileText, AlertCircle, Eye, Tag, Star } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface EvidenceCardProps {
  evidence: Evidence;
  onReview: (evidenceId: string) => void;
}

export function EvidenceCard({ evidence, onReview }: EvidenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'evidence',
    item: { id: evidence.id, evidence },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  const getEvidenceIcon = () => {
    switch (evidence.type) {
      case 'timeline_event':
        return <Clock size={16} className="text-blue-600" />;
      case 'slack_message':
        return <MessageSquare size={16} className="text-green-600" />;
      case 'log_entry':
        return <FileText size={16} className="text-orange-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (evidence.type) {
      case 'timeline_event':
        return 'Timeline Event';
      case 'slack_message':
        return 'Communication';
      case 'log_entry':
        return 'System Log';
      default:
        return 'Evidence';
    }
  };

  const handleReview = () => {
    if (!evidence.isReviewed) {
      onReview(evidence.id);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSignificanceColor = (significance?: number) => {
    if (!significance) return 'text-gray-400';
    if (significance >= 8) return 'text-red-500';
    if (significance >= 6) return 'text-orange-500';
    return 'text-yellow-500';
  };

  return (
    <div
      ref={drag as any}
      className={`evidence-card p-4 cursor-pointer transition-all ${
        isDragging ? 'opacity-50 scale-105' : ''
      } ${evidence.isReviewed ? 'ring-2 ring-detective-gold ring-opacity-50' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getEvidenceIcon()}
          <span className="text-xs font-medium text-detective-brown uppercase tracking-wide">
            {getTypeLabel()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {evidence.significance && (
            <div className="flex items-center gap-1">
              <Star size={12} className={getSignificanceColor(evidence.significance)} />
              <span className="text-xs text-detective-brown">{evidence.significance}</span>
            </div>
          )}
          
          {evidence.isReviewed && (
            <Eye size={16} className="text-detective-gold" />
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-detective-dark mb-2 line-clamp-2">
        {evidence.title}
      </h4>

      {/* Content Preview */}
      <p className={`text-detective-brown text-sm mb-3 ${
        isExpanded ? '' : 'line-clamp-3'
      }`}>
        {evidence.content}
      </p>

      {/* Metadata */}
      <div className="space-y-2 text-xs text-detective-brown/80">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formatTimestamp(evidence.timestamp)}
          </span>
          <span className="font-medium">{evidence.source}</span>
        </div>
        
        {evidence.tags && evidence.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag size={10} />
            {evidence.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-1.5 py-0.5 bg-detective-cream rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      {!evidence.isReviewed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReview();
          }}
          className="mt-3 w-full bg-detective-brown hover:bg-detective-dark text-white py-2 px-3 rounded text-sm font-medium transition-colors"
        >
          Mark as Reviewed
        </button>
      )}

      {/* Expand/Collapse Indicator */}
      {evidence.content.length > 100 && (
        <div className="mt-2 text-center">
          <button className="text-detective-brown hover:text-detective-dark text-xs">
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  );
}