import { NextRequest, NextResponse } from 'next/server';
import { PlayerRole } from '@/types';

// This would normally be stored in a database
// For now, we'll use a simple Map to simulate database storage
let gameRooms: Map<string, any> = new Map();

// Initialize with some mock data if needed
if (gameRooms.size === 0) {
  // This will be populated when games are created
}

export async function POST(request: NextRequest) {
  try {
    const { gameCode, playerName, role } = await request.json();
    
    if (!gameCode || !playerName) {
      return NextResponse.json(
        { error: 'Game code and player name are required' },
        { status: 400 }
      );
    }

    // Find game room by code
    const gameRoom = Array.from(gameRooms.values())
      .find((room: any) => room.code === gameCode.toUpperCase());
      
    if (!gameRoom) {
      return NextResponse.json(
        { error: 'Game not found. Please check the case code.' },
        { status: 404 }
      );
    }

    // Check if player name is already taken
    const existingPlayer = gameRoom.players.find((p: any) => 
      p.name.toLowerCase() === playerName.toLowerCase()
    );
    
    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Detective name already taken. Please choose a different name.' },
        { status: 400 }
      );
    }
    
    const playerId = crypto.randomUUID();
    const playerRole: PlayerRole = role || 'technical_analyst';
    
    const player = {
      id: playerId,
      name: playerName,
      role: playerRole,
      isOnline: true
    };
    
    // Add player to game room
    gameRoom.players.push(player);
    
    return NextResponse.json({
      gameId: gameRoom.id,
      playerId,
      gameRoom: {
        id: gameRoom.id,
        code: gameRoom.code,
        incidentId: gameRoom.incidentId,
        incidentData: gameRoom.incidentData,
        aiAnalysis: gameRoom.aiAnalysis,
        players: gameRoom.players,
        evidence: gameRoom.evidence,
        theories: gameRoom.theories,
        currentPhase: gameRoom.currentPhase,
        gameState: gameRoom.gameState,
        createdAt: gameRoom.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}

// Helper functions for server access (not exported from API route)
function getGameRooms() {
  return gameRooms;
}

function setGameRooms(rooms: Map<string, any>) {
  gameRooms = rooms;
}