'use client';

import { Player } from '@/types';
import { User, Crown, FileSearch, Brain, MessageCircle, Badge } from 'lucide-react';

interface PlayerListProps {
  players: Player[];
  currentPlayer: Player;
}

const ROLE_ICONS = {
  lead_detective: Crown,
  timeline_specialist: FileSearch,
  technical_analyst: Brain,
  witness_interviewer: MessageCircle,
  evidence_coordinator: Badge
};

const ROLE_COLORS = {
  lead_detective: 'text-detective-gold',
  timeline_specialist: 'text-blue-400', 
  technical_analyst: 'text-green-400',
  witness_interviewer: 'text-purple-400',
  evidence_coordinator: 'text-orange-400'
};

export function PlayerList({ players, currentPlayer }: PlayerListProps) {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <User size={20} />
        Investigation Team
      </h3>
      
      <div className="space-y-3">
        {players.map((player) => {
          const IconComponent = ROLE_ICONS[player.role] || User;
          const colorClass = ROLE_COLORS[player.role] || 'text-detective-cream';
          const isCurrentPlayer = player.id === currentPlayer.id;
          
          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg border transition-all ${
                isCurrentPlayer
                  ? 'bg-detective-gold/20 border-detective-gold'
                  : 'bg-detective-dark/50 border-detective-cream/20'
              } ${
                player.isOnline 
                  ? 'opacity-100' 
                  : 'opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <IconComponent size={20} className={colorClass} />
                  <div 
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-detective-dark ${
                      player.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-detective-cream truncate">
                    {player.name}
                    {isCurrentPlayer && (
                      <span className="text-detective-gold ml-1">(You)</span>
                    )}
                  </div>
                  <div className="text-xs text-detective-cream/70 truncate">
                    {getRoleLabel(player.role)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Guide */}
      <div className="mt-8 p-3 bg-detective-dark/30 rounded-lg">
        <h4 className="font-semibold text-detective-cream mb-3 text-sm">
          Detective Roles
        </h4>
        <div className="space-y-2 text-xs text-detective-cream/80">
          <div className="flex items-center gap-2">
            <Crown size={12} className="text-detective-gold" />
            <span>Lead Detective: Coordinates & decides</span>
          </div>
          <div className="flex items-center gap-2">
            <FileSearch size={12} className="text-blue-400" />
            <span>Timeline: Sequences events</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain size={12} className="text-green-400" />
            <span>Technical: Analyzes evidence</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={12} className="text-purple-400" />
            <span>Interviewer: Reviews comms</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge size={12} className="text-orange-400" />
            <span>Coordinator: Organizes materials</span>
          </div>
        </div>
      </div>
    </div>
  );
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