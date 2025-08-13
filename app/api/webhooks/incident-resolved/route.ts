import { NextRequest, NextResponse } from 'next/server';
import { incidentIoService } from '@/lib/incidentIoMcp';
import { aiService } from '@/lib/aiService';
import crypto from 'crypto';

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

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-incident-signature');
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Verify webhook signature for security
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    const webhookData = JSON.parse(body);
    
    // Check if this is an incident.resolved event
    if (webhookData.event_type !== 'incident.resolved' && webhookData.type !== 'incident.resolved') {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    const incident = webhookData.incident || webhookData.data?.incident;
    if (!incident || !incident.id) {
      return NextResponse.json(
        { error: 'Invalid incident data' },
        { status: 400 }
      );
    }

    console.log(`Creating detective game for resolved incident: ${incident.id}`);

    // Fetch full incident data
    const incidentData = await incidentIoService.fetchIncident(incident.id);
    
    // Generate AI analysis
    const aiAnalysis = await aiService.analyzeIncident(incidentData);
    
    // Create detective game
    const gameId = crypto.randomUUID();
    const gameCode = generateGameCode();
    
    const gameRoom = {
      id: gameId,
      code: gameCode,
      incidentId: incident.id,
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
      createdAt: new Date(),
      autoCreated: true // Flag to indicate this was auto-created
    };
    
    // Store game room
    gameRooms.set(gameId, gameRoom);
    
    // Generate join URLs for responders
    const joinUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/game/${gameCode}`;
    
    const responderNotifications = incidentData.responders?.map(responder => ({
      name: responder.name,
      joinUrl: `${joinUrl}?player=${encodeURIComponent(responder.name)}&role=technical_analyst`
    })) || [];

    console.log(`Detective game created: ${gameCode} for incident ${incident.id}`);
    
    // In a real implementation, you might want to:
    // 1. Send Slack notifications to responders
    // 2. Create incident.io follow-up tasks
    // 3. Store in database for persistence
    
    return NextResponse.json({
      success: true,
      gameId,
      gameCode,
      joinUrl,
      incidentId: incident.id,
      incidentTitle: incidentData.title,
      responderInvites: responderNotifications,
      message: `Detective game created for incident: ${incidentData.title}`
    });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification (if needed)
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  
  if (challenge) {
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({
    message: 'incident.io webhook endpoint for Detective incident.io',
    events: ['incident.resolved'],
    status: 'active'
  });
}

// Game rooms available for internal use (not an API export)
// gameRooms Map is available within this module