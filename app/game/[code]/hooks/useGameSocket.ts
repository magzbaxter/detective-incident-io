'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameRoom, Player, GamePhase } from '@/types';

interface GameSocketEvents {
  onGameStateUpdate: (gameRoom: GameRoom) => void;
  onPlayerJoined: (player: Player) => void;
  onPlayerLeft: (player: Player) => void;
  onPhaseChanged: (phase: GamePhase) => void;
  onEvidenceUpdated: (evidence: any[]) => void;
  onTheoryAdded: (theory: any) => void;
  onTheoryVoted: (data: { theoryId: string; votes: string[] }) => void;
  onCursorUpdate?: (data: { playerId: string; cursor: { x: number; y: number } }) => void;
}

export function useGameSocket(
  gameId: string,
  playerId: string,
  events: GameSocketEvents
) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to game server');
      setIsConnected(true);
      
      // Join the game room
      socket.emit('join-game', { gameId, playerId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from game server');
      setIsConnected(false);
    });

    // Game events
    socket.on('game-state', events.onGameStateUpdate);
    socket.on('player-joined', events.onPlayerJoined);
    socket.on('player-left', events.onPlayerLeft);
    socket.on('phase-changed', events.onPhaseChanged);
    socket.on('evidence-updated', events.onEvidenceUpdated);
    socket.on('theory-added', events.onTheoryAdded);
    socket.on('theory-voted', events.onTheoryVoted);
    
    if (events.onCursorUpdate) {
      socket.on('cursor-update', events.onCursorUpdate);
    }

    // Mouse tracking for collaborative cursors
    const handleMouseMove = (e: MouseEvent) => {
      if (socket.connected) {
        const cursor = { x: e.clientX, y: e.clientY };
        socket.emit('cursor-move', { gameId, playerId, cursor });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      socket.disconnect();
    };
  }, [gameId, playerId]);

  return socketRef.current;
}