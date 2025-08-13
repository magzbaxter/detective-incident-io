'use client';

import { useState, useEffect } from 'react';
import { GameRoom as GameRoomType, Player, GamePhase } from '@/types';
import { GameHeader } from './GameHeader';
import { PlayerList } from './PlayerList';
import { GamePhases } from './GamePhases';
import { useGameSocket } from '../hooks/useGameSocket';
import { useIsMobile } from '@/utils/responsive';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Menu, X } from 'lucide-react';

interface GameRoomProps {
  gameRoom: GameRoomType;
  currentPlayer: Player;
  onGameRoomUpdate: (gameRoom: GameRoomType) => void;
}

export function GameRoom({ gameRoom, currentPlayer, onGameRoomUpdate }: GameRoomProps) {
  const [localGameRoom, setLocalGameRoom] = useState(gameRoom);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const socket = useGameSocket(gameRoom.id, currentPlayer.id, {
    onGameStateUpdate: (updatedRoom) => {
      setLocalGameRoom(updatedRoom);
      onGameRoomUpdate(updatedRoom);
    },
    onPlayerJoined: (player) => {
      setLocalGameRoom(prev => ({
        ...prev,
        players: [...prev.players.filter(p => p.id !== player.id), player]
      }));
    },
    onPlayerLeft: (player) => {
      setLocalGameRoom(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === player.id ? { ...p, isOnline: false } : p
        )
      }));
    },
    onPhaseChanged: (newPhase) => {
      setLocalGameRoom(prev => ({
        ...prev,
        currentPhase: newPhase,
        gameState: { ...prev.gameState, phase: newPhase }
      }));
    },
    onEvidenceUpdated: (evidence) => {
      setLocalGameRoom(prev => ({
        ...prev,
        evidence
      }));
    },
    onTheoryAdded: (theory) => {
      setLocalGameRoom(prev => ({
        ...prev,
        theories: [...prev.theories, theory]
      }));
    },
    onTheoryVoted: ({ theoryId, votes }) => {
      setLocalGameRoom(prev => ({
        ...prev,
        theories: prev.theories.map(t => 
          t.id === theoryId ? { ...t, votes } : t
        )
      }));
    }
  });

  const handlePhaseAdvance = (newPhase: GamePhase) => {
    socket?.emit('phase-advance', {
      gameId: gameRoom.id,
      newPhase
    });
  };

  const handleEvidenceUpdate = (evidence: any[]) => {
    socket?.emit('evidence-update', {
      gameId: gameRoom.id,
      evidence
    });
  };

  const handleTheorySubmit = (theory: any) => {
    socket?.emit('theory-submit', {
      gameId: gameRoom.id,
      theory
    });
  };

  const handleTheoryVote = (theoryId: string) => {
    socket?.emit('vote-theory', {
      gameId: gameRoom.id,
      theoryId,
      playerId: currentPlayer.id
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-detective-cream">
        <GameHeader 
          gameRoom={localGameRoom}
          currentPlayer={currentPlayer}
        />
        
        <div className="flex relative">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-20 left-4 z-50 bg-detective-dark text-detective-cream p-3 rounded-full shadow-lg md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {/* Sidebar */}
          <div className={`${
            isMobile 
              ? `fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'w-80'
          } bg-detective-dark text-detective-cream p-6 min-h-screen overflow-y-auto`}>
            <PlayerList 
              players={localGameRoom.players}
              currentPlayer={currentPlayer}
            />
          </div>

          {/* Overlay for mobile */}
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 z-30 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className={`flex-1 p-4 md:p-6 ${isMobile ? 'pl-4' : ''}`}>
            <GamePhases
              gameRoom={localGameRoom}
              currentPlayer={currentPlayer}
              onPhaseAdvance={handlePhaseAdvance}
              onEvidenceUpdate={handleEvidenceUpdate}
              onTheorySubmit={handleTheorySubmit}
              onTheoryVote={handleTheoryVote}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}