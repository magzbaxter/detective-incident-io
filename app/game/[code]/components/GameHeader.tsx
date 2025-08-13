'use client';

import { GameRoom, Player } from '@/types';
import { Search, Clock, Users, FileText } from 'lucide-react';

interface GameHeaderProps {
  gameRoom: GameRoom;
  currentPlayer: Player;
}

const PHASE_LABELS = {
  briefing: 'Detective Briefing',
  evidence_review: 'Evidence Review',
  theory_development: 'Theory Development', 
  investigation: 'Active Investigation',
  conclusion: 'Drawing Conclusions',
  postmortem: 'Post-Mortem Generation'
};

const PHASE_DESCRIPTIONS = {
  briefing: 'Inspector Mortem presents the case details and initial analysis',
  evidence_review: 'Examine all available evidence and organize investigation materials',
  theory_development: 'Develop and propose theories about the root cause',
  investigation: 'Test theories against evidence and validate findings',
  conclusion: 'Reach consensus on the final root cause analysis',
  postmortem: 'Generate comprehensive post-mortem documentation'
};

export function GameHeader({ gameRoom, currentPlayer }: GameHeaderProps) {
  const onlinePlayers = gameRoom.players.filter(p => p.isOnline);
  
  return (
    <header className="bg-detective-dark text-detective-cream shadow-lg">
      <div className="px-6 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Search size={32} className="text-detective-gold" />
            <div>
              <h1 className="text-2xl font-bold font-detective">
                Case {gameRoom.code}
              </h1>
              <p className="text-detective-cream/80 text-sm">
                {gameRoom.incidentData?.title || 'Loading incident details...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{onlinePlayers.length} Detective{onlinePlayers.length !== 1 ? 's' : ''} Active</span>
            </div>
            
            {gameRoom.createdAt && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Started {formatTime(gameRoom.createdAt)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>{gameRoom.evidence?.length || 0} Evidence Items</span>
            </div>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="bg-detective-brown/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">
              Current Phase: {PHASE_LABELS[gameRoom.currentPhase]}
            </h2>
            <div className="text-sm text-detective-cream/80">
              Detective {currentPlayer.name} • {getRoleLabel(currentPlayer.role)}
            </div>
          </div>
          
          <p className="text-detective-cream/90 text-sm">
            {PHASE_DESCRIPTIONS[gameRoom.currentPhase]}
          </p>
          
          {/* Phase Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-detective-cream/70 mb-1">
              <span>Investigation Progress</span>
              <span>{getPhaseProgress(gameRoom.currentPhase)}%</span>
            </div>
            <div className="w-full bg-detective-dark rounded-full h-2">
              <div 
                className="bg-detective-gold h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPhaseProgress(gameRoom.currentPhase)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  }
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h ${diffMins % 60}m ago`;
  }
  
  return d.toLocaleDateString();
}

function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    lead_detective: 'Lead Detective',
    timeline_specialist: 'Timeline Specialist',
    technical_analyst: 'Technical Analyst', 
    witness_interviewer: 'Witness Interviewer',
    evidence_coordinator: 'Evidence Coordinator'
  };
  return roleLabels[role] || role;
}

function getPhaseProgress(phase: string): number {
  const phaseProgress: Record<string, number> = {
    briefing: 10,
    evidence_review: 30,
    theory_development: 50,
    investigation: 70,
    conclusion: 85,
    postmortem: 100
  };
  return phaseProgress[phase] || 0;
}