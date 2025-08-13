'use client';

import { GameRoom, Player, GamePhase, Evidence, Theory } from '@/types';
import { BriefingPhase } from './phases/BriefingPhase';
import { EvidenceReviewPhase } from './phases/EvidenceReviewPhase';
import { TheoryDevelopmentPhase } from './phases/TheoryDevelopmentPhase';
import { InvestigationPhase } from './phases/InvestigationPhase';
import { ConclusionPhase } from './phases/ConclusionPhase';
import { PostMortemPhase } from './phases/PostMortemPhase';

interface GamePhasesProps {
  gameRoom: GameRoom;
  currentPlayer: Player;
  onPhaseAdvance: (newPhase: GamePhase) => void;
  onEvidenceUpdate: (evidence: Evidence[]) => void;
  onTheorySubmit: (theory: Theory) => void;
  onTheoryVote: (theoryId: string) => void;
}

export function GamePhases({
  gameRoom,
  currentPlayer,
  onPhaseAdvance,
  onEvidenceUpdate,
  onTheorySubmit,
  onTheoryVote
}: GamePhasesProps) {
  const currentPhase = gameRoom.currentPhase;

  const renderPhase = () => {
    switch (currentPhase) {
      case 'briefing':
        return (
          <BriefingPhase
            gameRoom={gameRoom}
            currentPlayer={currentPlayer}
            onPhaseAdvance={onPhaseAdvance}
          />
        );
      
      case 'evidence_review':
        return (
          <EvidenceReviewPhase
            gameRoom={gameRoom}
            currentPlayer={currentPlayer}
            onPhaseAdvance={onPhaseAdvance}
            onEvidenceUpdate={onEvidenceUpdate}
          />
        );
      
      case 'theory_development':
        return (
          <TheoryDevelopmentPhase
            gameRoom={gameRoom}
            currentPlayer={currentPlayer}
            onPhaseAdvance={onPhaseAdvance}
            onTheorySubmit={onTheorySubmit}
          />
        );
      
      case 'investigation':
        return (
          <InvestigationPhase
            gameRoom={gameRoom}
            currentPlayer={currentPlayer}
            onPhaseAdvance={onPhaseAdvance}
            onTheoryVote={onTheoryVote}
          />
        );
      
      case 'conclusion':
        return (
          <ConclusionPhase
            gameRoom={gameRoom}
            currentPlayer={currentPlayer}
            onPhaseAdvance={onPhaseAdvance}
          />
        );
      
      case 'postmortem':
        return (
          <PostMortemPhase
            gameRoom={gameRoom}
            currentPlayer={currentPlayer}
          />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-detective-dark text-lg">
              Unknown investigation phase. Please refresh the page.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {renderPhase()}
    </div>
  );
}