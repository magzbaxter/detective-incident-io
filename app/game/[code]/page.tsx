'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { GameRoom } from './components/GameRoom';
import { JoinGameForm } from './components/JoinGameForm';
import { LoadingScreen } from './components/LoadingScreen';
import { GameRoom as GameRoomType, Player } from '@/types';

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameCode = params.code as string;
  const playerName = searchParams.get('player');
  
  const [gameRoom, setGameRoom] = useState<GameRoomType | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'joining' | 'playing' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playerName && gameCode) {
      attemptJoinGame(playerName, gameCode);
    } else {
      setGameState('joining');
    }
  }, [playerName, gameCode]);

  const attemptJoinGame = async (name: string, code: string) => {
    try {
      setGameState('loading');
      
      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameCode: code, 
          playerName: name, 
          role: 'technical_analyst' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join game');
      }

      const { gameId, playerId, gameRoom: room } = await response.json();
      
      const player: Player = {
        id: playerId,
        name: name,
        role: 'technical_analyst',
        isOnline: true
      };

      setGameRoom(room);
      setCurrentPlayer(player);
      setGameState('playing');
    } catch (err) {
      console.error('Failed to join game:', err);
      setError(err instanceof Error ? err.message : 'Failed to join game');
      setGameState('error');
    }
  };

  const handleJoinGame = async (playerName: string, role: string) => {
    await attemptJoinGame(playerName, gameCode);
  };

  if (gameState === 'loading') {
    return <LoadingScreen message="Entering the detective bureau..." />;
  }

  if (gameState === 'error') {
    return (
      <div className="min-h-screen bg-detective-cream flex items-center justify-center">
        <div className="detective-paper rounded-lg p-8 max-w-md text-center shadow-lg">
          <h2 className="text-2xl font-bold text-detective-dark mb-4">
            Investigation Not Found
          </h2>
          <p className="text-detective-brown mb-6">
            {error || 'The case you\'re looking for doesn\'t exist or has been closed.'}
          </p>
          <a
            href="/"
            className="bg-detective-brown hover:bg-detective-dark text-white px-6 py-3 rounded-md font-semibold transition-colors"
          >
            Return to Bureau
          </a>
        </div>
      </div>
    );
  }

  if (gameState === 'joining') {
    return (
      <div className="min-h-screen bg-detective-cream flex items-center justify-center">
        <JoinGameForm 
          gameCode={gameCode} 
          onJoin={handleJoinGame}
          defaultName={playerName || ''}
        />
      </div>
    );
  }

  if (!gameRoom || !currentPlayer) {
    return <LoadingScreen message="Preparing investigation materials..." />;
  }

  return (
    <GameRoom 
      gameRoom={gameRoom}
      currentPlayer={currentPlayer}
      onGameRoomUpdate={setGameRoom}
    />
  );
}