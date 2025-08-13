import { NextRequest, NextResponse } from 'next/server';
import { incidentIoService } from '@/lib/incidentIoMcp';
import { aiService } from '@/lib/aiService';

// This would normally be stored in a database
const gameRooms = new Map();

function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CASE-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const { incidentId } = await request.json();
    
    if (!incidentId) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      );
    }

    const gameId = crypto.randomUUID();
    const gameCode = generateGameCode();
    
    // Fetch incident data from incident.io
    const incidentData = await incidentIoService.fetchIncident(incidentId);
    
    // Generate AI analysis
    const aiAnalysis = await aiService.analyzeIncident(incidentData);
    
    const gameRoom = {
      id: gameId,
      code: gameCode,
      incidentId,
      incidentData,
      aiAnalysis,
      players: [],
      evidence: aiAnalysis.evidenceCategories?.flatMap(cat => 
        cat.items.map((item, index) => ({
          id: `evidence-${cat.name}-${index}`,
          type: 'log_entry' as const,
          title: item,
          content: `Evidence details for: ${item}`,
          timestamp: new Date(),
          source: cat.name.toLowerCase().replace(/\s+/g, '_'),
          category: cat.name,
          isReviewed: false,
          tags: [],
          significance: cat.significance
        }))
      ) || [],
      theories: aiAnalysis.suggestedTheories || [],
      currentPhase: 'briefing' as const,
      gameState: { phase: 'briefing' as const },
      createdAt: new Date()
    };
    
    // Store game room (in production, this would be in a database)
    gameRooms.set(gameId, gameRoom);
    
    return NextResponse.json({
      gameId,
      gameCode,
      joinUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/game/${gameCode}`
    });
    
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}