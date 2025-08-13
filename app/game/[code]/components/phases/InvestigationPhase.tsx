'use client';

import { useState } from 'react';
import { GameRoom, Player, Theory, GamePhase } from '@/types';
import { Search, ArrowRight, ThumbsUp, Brain, CheckCircle, XCircle } from 'lucide-react';

interface InvestigationPhaseProps {
  gameRoom: GameRoom;
  currentPlayer: Player;
  onPhaseAdvance: (newPhase: GamePhase) => void;
  onTheoryVote: (theoryId: string) => void;
}

export function InvestigationPhase({
  gameRoom,
  currentPlayer,
  onPhaseAdvance,
  onTheoryVote
}: InvestigationPhaseProps) {
  const [selectedTheory, setSelectedTheory] = useState<string | null>(null);
  
  const canAdvance = currentPlayer.role === 'lead_detective' || gameRoom.players.length === 1;
  const theories = gameRoom.theories || [];
  const evidence = gameRoom.evidence || [];
  
  // Calculate voting consensus
  const totalPlayers = gameRoom.players.filter(p => p.isOnline).length;
  const votingThreshold = Math.ceil(totalPlayers * 0.6); // 60% consensus
  const leadingTheory = theories.reduce((prev, current) => 
    (current.votes.length > prev.votes.length) ? current : prev
  , theories[0]);

  const handleVote = (theoryId: string) => {
    onTheoryVote(theoryId);
  };

  const handleAdvancePhase = () => {
    onPhaseAdvance('conclusion');
  };

  const hasUserVotedForTheory = (theory: Theory) => {
    return theory.votes.includes(currentPlayer.id);
  };

  const getValidationIcon = (validation?: { score: number }) => {
    if (!validation) return null;
    if (validation.score >= 80) return <CheckCircle className="text-green-500" size={16} />;
    if (validation.score >= 60) return <CheckCircle className="text-yellow-500" size={16} />;
    return <XCircle className="text-red-500" size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-detective-dark mb-2 flex items-center gap-3">
              <Search className="text-detective-brown" />
              Active Investigation
            </h2>
            <p className="text-detective-brown">
              Test theories against evidence and vote for the most plausible root cause. 
              Reach team consensus to proceed.
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-detective-brown mb-1">
              Consensus Progress
            </div>
            <div className="text-2xl font-bold text-detective-dark">
              {leadingTheory ? Math.round((leadingTheory.votes.length / totalPlayers) * 100) : 0}%
            </div>
            <div className="text-sm text-detective-brown">
              {leadingTheory?.votes.length || 0} of {totalPlayers} votes
            </div>
          </div>
        </div>
        
        {/* Consensus Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-detective-brown mb-1">
            <span>Team Consensus</span>
            <span>Need {votingThreshold} votes to proceed</span>
          </div>
          <div className="w-full bg-detective-cream rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                (leadingTheory?.votes.length || 0) >= votingThreshold 
                  ? 'bg-green-500' 
                  : 'bg-detective-gold'
              }`}
              style={{ 
                width: `${Math.min(((leadingTheory?.votes.length || 0) / totalPlayers) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Theory Investigation */}
      <div className="grid gap-6">
        {theories.map((theory) => (
          <div 
            key={theory.id}
            className={`detective-paper rounded-lg p-6 shadow-lg border-2 transition-all ${
              selectedTheory === theory.id 
                ? 'border-detective-gold' 
                : 'border-transparent hover:border-detective-brown/30'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-detective-dark mb-2">
                  {theory.title}
                </h3>
                <p className="text-detective-brown text-sm mb-1">
                  Proposed by <span className="font-medium">{theory.proposedBy}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {theory.aiValidation && (
                  <div className="flex items-center gap-2">
                    {getValidationIcon(theory.aiValidation)}
                    <span className="text-sm font-medium">
                      AI Score: {theory.aiValidation.score}/100
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-detective-dark">
                    {theory.votes.length}
                  </div>
                  <div className="text-sm text-detective-brown">
                    vote{theory.votes.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-detective-dark mb-4 leading-relaxed">
              {theory.description}
            </p>

            <div className="bg-detective-cream rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-detective-dark mb-2">Root Cause Analysis:</h4>
              <p className="text-detective-dark">{theory.rootCause}</p>
            </div>

            {theory.aiValidation && (
              <div className="bg-detective-brown/10 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-detective-brown" />
                  <span className="font-semibold text-detective-dark">Inspector Mortem's Analysis</span>
                </div>
                <p className="text-detective-dark mb-3">{theory.aiValidation.reasoning}</p>
                
                {theory.aiValidation.supportingPatterns && theory.aiValidation.supportingPatterns.length > 0 && (
                  <div className="mb-2">
                    <h5 className="font-medium text-detective-dark mb-1">Supporting Evidence:</h5>
                    <ul className="text-sm text-detective-brown space-y-1">
                      {theory.aiValidation.supportingPatterns.map((pattern, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-green-500" />
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {theory.aiValidation.contradictions && theory.aiValidation.contradictions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-detective-dark mb-1">Potential Issues:</h5>
                    <ul className="text-sm text-detective-brown space-y-1">
                      {theory.aiValidation.contradictions.map((contradiction, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <XCircle size={12} className="text-red-500" />
                          {contradiction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Voting */}
            <div className="flex items-center justify-between border-t border-detective-brown/20 pt-4">
              <div className="flex items-center gap-2 text-sm text-detective-brown">
                <span>Voted by:</span>
                {theory.votes.length > 0 ? (
                  <span>
                    {theory.votes.map(playerId => {
                      const player = gameRoom.players.find(p => p.id === playerId);
                      return player?.name;
                    }).filter(Boolean).join(', ')}
                  </span>
                ) : (
                  <span>No votes yet</span>
                )}
              </div>
              
              <button
                onClick={() => handleVote(theory.id)}
                disabled={hasUserVotedForTheory(theory)}
                className={`px-6 py-2 rounded-md font-semibold transition-colors flex items-center gap-2 ${
                  hasUserVotedForTheory(theory)
                    ? 'bg-detective-gold text-detective-dark cursor-not-allowed'
                    : 'bg-detective-brown hover:bg-detective-dark text-white'
                }`}
              >
                <ThumbsUp size={16} />
                {hasUserVotedForTheory(theory) ? 'Voted' : 'Vote for This Theory'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {theories.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-detective-brown/50 mb-4" />
          <p className="text-detective-brown text-lg">
            No theories to investigate. Please return to theory development phase.
          </p>
        </div>
      )}

      {/* Phase Navigation */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-detective-dark mb-2">
              Ready to Draw Conclusions?
            </h3>
            <p className="text-detective-brown text-sm">
              Once the team reaches consensus on the most likely theory, we can proceed to finalize our conclusions.
            </p>
          </div>
          
          {canAdvance && (
            <button
              onClick={handleAdvancePhase}
              disabled={!leadingTheory || leadingTheory.votes.length < votingThreshold}
              className="bg-detective-brown hover:bg-detective-dark text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Draw Conclusions
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        
        {!canAdvance && (
          <p className="text-sm text-detective-brown/70 mt-4">
            Only the Lead Detective can advance the investigation phases.
          </p>
        )}
        
        {canAdvance && (!leadingTheory || leadingTheory.votes.length < votingThreshold) && (
          <p className="text-sm text-detective-red mt-4">
            Need {votingThreshold} votes on a single theory to proceed ({(leadingTheory?.votes.length || 0)} current).
          </p>
        )}
      </div>
    </div>
  );
}