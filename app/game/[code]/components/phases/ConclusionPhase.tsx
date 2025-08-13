'use client';

import { GameRoom, Player, GamePhase } from '@/types';
import { CheckCircle, ArrowRight, FileText, Clock, Users } from 'lucide-react';

interface ConclusionPhaseProps {
  gameRoom: GameRoom;
  currentPlayer: Player;
  onPhaseAdvance: (newPhase: GamePhase) => void;
}

export function ConclusionPhase({
  gameRoom,
  currentPlayer,
  onPhaseAdvance
}: ConclusionPhaseProps) {
  const canAdvance = currentPlayer.role === 'lead_detective' || gameRoom.players.length === 1;
  const theories = gameRoom.theories || [];
  
  // Find the winning theory (most votes)
  const winningTheory = theories.reduce((prev, current) => 
    (current.votes.length > prev.votes.length) ? current : prev
  , theories[0]);

  const handleAdvancePhase = () => {
    onPhaseAdvance('postmortem');
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start || !end) return 'Unknown';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins} minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Case Closed Header */}
      <div className="detective-paper rounded-lg p-8 shadow-lg text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-detective-dark mb-4">
          Case Closed
        </h2>
        
        <p className="text-detective-brown text-lg leading-relaxed max-w-2xl mx-auto">
          Excellent detective work, team! Through careful analysis of the evidence and collaborative investigation, 
          we have reached a consensus on the root cause of this incident.
        </p>
      </div>

      {/* Final Conclusion */}
      {winningTheory && (
        <div className="detective-paper rounded-lg p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-detective-dark mb-6 flex items-center gap-3">
            <FileText className="text-detective-brown" />
            Final Root Cause Determination
          </h3>
          
          <div className="bg-detective-gold/10 border-2 border-detective-gold rounded-lg p-6 mb-6">
            <h4 className="text-xl font-bold text-detective-dark mb-3">
              {winningTheory.title}
            </h4>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-detective-dark">
                  {winningTheory.votes.length}
                </div>
                <div className="text-sm text-detective-brown">Team Votes</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-detective-dark">
                  {winningTheory.aiValidation?.score || 'N/A'}
                </div>
                <div className="text-sm text-detective-brown">AI Confidence</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-detective-dark">
                  {Math.round((winningTheory.votes.length / gameRoom.players.length) * 100)}%
                </div>
                <div className="text-sm text-detective-brown">Consensus</div>
              </div>
            </div>
            
            <p className="text-detective-dark mb-4 leading-relaxed">
              <span className="font-semibold">Analysis:</span> {winningTheory.description}
            </p>
            
            <div className="bg-white rounded p-4">
              <h5 className="font-semibold text-detective-dark mb-2">Root Cause:</h5>
              <p className="text-detective-dark">{winningTheory.rootCause}</p>
            </div>
          </div>
          
          <div className="text-center text-detective-brown">
            <p className="italic">
              "Truth will come to light; murder cannot be hid long." - Detective Inspector Mortem
            </p>
          </div>
        </div>
      )}

      {/* Investigation Summary */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-detective-dark mb-4 flex items-center gap-2">
          <Users className="text-detective-brown" />
          Investigation Summary
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-detective-dark mb-3">Case Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-detective-brown">Incident:</span>
                <span className="text-detective-dark font-medium">
                  {gameRoom.incidentData?.title || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Severity:</span>
                <span className="text-detective-dark font-medium capitalize">
                  {gameRoom.incidentData?.severity || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Duration:</span>
                <span className="text-detective-dark font-medium">
                  {formatDuration(gameRoom.incidentData?.createdAt, gameRoom.incidentData?.resolvedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Evidence Reviewed:</span>
                <span className="text-detective-dark font-medium">
                  {(gameRoom.evidence?.length || 0) + (gameRoom.incidentData?.timeline?.length || 0)} items
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-detective-dark mb-3">Investigation Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-detective-brown">Investigation Time:</span>
                <span className="text-detective-dark font-medium">
                  {formatDuration(gameRoom.createdAt, new Date())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Active Detectives:</span>
                <span className="text-detective-dark font-medium">
                  {gameRoom.players.filter(p => p.isOnline).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Theories Proposed:</span>
                <span className="text-detective-dark font-medium">
                  {theories.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Final Consensus:</span>
                <span className="text-detective-dark font-medium">
                  {winningTheory?.title || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Recognition */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-detective-dark mb-4">
          Detective Recognition
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-detective-dark mb-3">Investigation Team</h4>
            <div className="space-y-2">
              {gameRoom.players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-detective-cream rounded">
                  <div>
                    <span className="font-medium text-detective-dark">{player.name}</span>
                    <span className="text-detective-brown text-sm ml-2">
                      ({player.role.replace('_', ' ')})
                    </span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    player.isOnline ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-detective-dark mb-3">Key Contributors</h4>
            <div className="space-y-2 text-sm">
              {winningTheory && (
                <div className="p-2 bg-detective-gold/20 rounded">
                  <span className="font-medium text-detective-dark">Theory Author:</span>
                  <span className="ml-2 text-detective-dark">{winningTheory.proposedBy}</span>
                </div>
              )}
              <div className="p-2 bg-detective-cream rounded">
                <span className="font-medium text-detective-dark">Lead Detective:</span>
                <span className="ml-2 text-detective-dark">
                  {gameRoom.players.find(p => p.role === 'lead_detective')?.name || 'None assigned'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Post-Mortem */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-detective-dark mb-2">
              Ready to Generate Post-Mortem?
            </h3>
            <p className="text-detective-brown text-sm">
              Transform our investigation findings into a comprehensive post-mortem document 
              ready for stakeholder review and action planning.
            </p>
          </div>
          
          {canAdvance && (
            <button
              onClick={handleAdvancePhase}
              className="bg-detective-brown hover:bg-detective-dark text-white px-6 py-2 rounded-md font-semibold transition-colors flex items-center gap-2"
            >
              Generate Post-Mortem
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        
        {!canAdvance && (
          <p className="text-sm text-detective-brown/70 mt-4">
            Only the Lead Detective can advance to post-mortem generation.
          </p>
        )}
      </div>
    </div>
  );
}