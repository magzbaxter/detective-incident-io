'use client';

import { useState } from 'react';
import { GameRoom, Player, Evidence, GamePhase } from '@/types';
import { Search, ArrowRight, Pin, MessageSquare, FileText, AlertCircle, Clock } from 'lucide-react';
import { useDrop } from 'react-dnd';
import { EvidenceCard } from '../evidence/EvidenceCard';
import { EvidenceBoard } from '../evidence/EvidenceBoard';

interface EvidenceReviewPhaseProps {
  gameRoom: GameRoom;
  currentPlayer: Player;
  onPhaseAdvance: (newPhase: GamePhase) => void;
  onEvidenceUpdate: (evidence: Evidence[]) => void;
}

export function EvidenceReviewPhase({
  gameRoom,
  currentPlayer,
  onPhaseAdvance,
  onEvidenceUpdate
}: EvidenceReviewPhaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const canAdvance = currentPlayer.role === 'lead_detective' || gameRoom.players.length === 1;
  
  const evidence = gameRoom.evidence || [];
  const incidentData = gameRoom.incidentData;
  
  // Combine different types of evidence
  const allEvidence = [
    ...evidence,
    ...(incidentData?.timeline?.map((event: any, index: number) => ({
      id: `timeline-${index}`,
      type: 'timeline_event' as const,
      title: event.title,
      content: event.description,
      timestamp: new Date(event.timestamp),
      source: 'incident_timeline',
      category: 'Timeline',
      isReviewed: false,
      tags: [event.type],
      significance: 7
    })) || []),
    ...(incidentData?.slackMessages?.slice(0, 10).map((msg: any, index: number) => ({
      id: `slack-${index}`,
      type: 'slack_message' as const,
      title: `Message from ${msg.user}`,
      content: msg.text,
      timestamp: new Date(msg.timestamp),
      source: 'slack_channel',
      category: 'Communications',
      isReviewed: false,
      tags: [msg.type],
      significance: msg.type === 'alert' ? 8 : 5
    })) || [])
  ];

  const filteredEvidence = allEvidence.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(allEvidence.map(e => e.category)))];

  const handleAdvancePhase = () => {
    onPhaseAdvance('theory_development');
  };

  const handleEvidenceReview = (evidenceId: string) => {
    const updatedEvidence = allEvidence.map(e =>
      e.id === evidenceId ? { ...e, isReviewed: true } : e
    );
    onEvidenceUpdate(updatedEvidence);
  };

  const reviewedCount = allEvidence.filter(e => e.isReviewed).length;
  const reviewProgress = allEvidence.length > 0 ? Math.round((reviewedCount / allEvidence.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-detective-dark mb-2">
              Evidence Review & Organization
            </h2>
            <p className="text-detective-brown">
              Examine all available evidence and organize it on the investigation board.
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-detective-brown mb-1">
              Review Progress
            </div>
            <div className="text-2xl font-bold text-detective-dark">
              {reviewProgress}%
            </div>
            <div className="text-sm text-detective-brown">
              {reviewedCount} of {allEvidence.length} items
            </div>
          </div>
        </div>
        
        <div className="w-full bg-detective-cream rounded-full h-2 mb-4">
          <div 
            className="bg-detective-gold h-2 rounded-full transition-all duration-300"
            style={{ width: `${reviewProgress}%` }}
          />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="detective-paper rounded-lg p-4 shadow-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-detective-brown" />
              <input
                type="text"
                placeholder="Search evidence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-detective-brown rounded-md focus:outline-none focus:border-detective-gold bg-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-detective-gold text-detective-dark'
                    : 'bg-white border-2 border-detective-brown text-detective-dark hover:bg-detective-cream'
                }`}
              >
                {category === 'all' ? 'All Evidence' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidence.map(item => (
          <EvidenceCard
            key={item.id}
            evidence={item}
            onReview={handleEvidenceReview}
          />
        ))}
      </div>

      {filteredEvidence.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-detective-brown/50 mb-4" />
          <p className="text-detective-brown text-lg">
            No evidence matches your search criteria.
          </p>
        </div>
      )}

      {/* Evidence Board */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-detective-dark mb-4 flex items-center gap-2">
          <Pin className="text-detective-brown" />
          Investigation Board
        </h3>
        <EvidenceBoard 
          evidence={allEvidence.filter(e => e.isReviewed)}
        />
      </div>

      {/* Phase Navigation */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-detective-dark mb-2">
              Ready to Develop Theories?
            </h3>
            <p className="text-detective-brown text-sm">
              Once the team has reviewed sufficient evidence, we can begin developing theories about the root cause.
            </p>
          </div>
          
          {canAdvance && (
            <button
              onClick={handleAdvancePhase}
              className="bg-detective-brown hover:bg-detective-dark text-white px-6 py-2 rounded-md font-semibold transition-colors flex items-center gap-2"
            >
              Develop Theories
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        
        {!canAdvance && (
          <p className="text-sm text-detective-brown/70 mt-4">
            Only the Lead Detective can advance the investigation phases.
          </p>
        )}
      </div>
    </div>
  );
}

function getEvidenceIcon(type: string) {
  switch (type) {
    case 'timeline_event':
      return <Clock size={16} />;
    case 'slack_message':
      return <MessageSquare size={16} />;
    case 'log_entry':
      return <FileText size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
}