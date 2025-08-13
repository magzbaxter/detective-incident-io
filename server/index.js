const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage for the prototype
const gameRooms = new Map();
const activePlayers = new Map();

// Generate game code
function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CASE-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create new game room
app.post('/api/games/create', async (req, res) => {
  try {
    const { incidentId } = req.body;
    const gameId = uuidv4();
    const gameCode = generateGameCode();
    
    // Mock incident data fetch (replace with real incident.io API)
    const incidentData = await fetchIncidentData(incidentId);
    const aiAnalysis = await generateAIAnalysis(incidentData);
    
    const gameRoom = {
      id: gameId,
      code: gameCode,
      incidentId,
      incidentData,
      aiAnalysis,
      players: [],
      evidence: aiAnalysis.evidence || [],
      theories: aiAnalysis.suggestedTheories || [],
      currentPhase: 'briefing',
      gameState: { phase: 'briefing' },
      createdAt: new Date()
    };
    
    gameRooms.set(gameId, gameRoom);
    
    res.json({ 
      gameId, 
      gameCode, 
      joinUrl: `http://localhost:3000/game/${gameCode}` 
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Join game
app.post('/api/games/join', (req, res) => {
  const { gameCode, playerName, role } = req.body;
  
  const gameRoom = Array.from(gameRooms.values())
    .find(room => room.code === gameCode);
    
  if (!gameRoom) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  const playerId = uuidv4();
  const player = {
    id: playerId,
    name: playerName,
    role: role || 'technical_analyst',
    isOnline: true
  };
  
  gameRoom.players.push(player);
  
  res.json({ 
    gameId: gameRoom.id,
    playerId,
    gameRoom: {
      ...gameRoom,
      players: gameRoom.players
    }
  });
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  socket.on('join-game', ({ gameId, playerId }) => {
    socket.join(gameId);
    const gameRoom = gameRooms.get(gameId);
    
    if (gameRoom) {
      const player = gameRoom.players.find(p => p.id === playerId);
      if (player) {
        player.isOnline = true;
        activePlayers.set(socket.id, { gameId, playerId });
        
        // Broadcast player joined
        socket.to(gameId).emit('player-joined', player);
        
        // Send current game state
        socket.emit('game-state', gameRoom);
      }
    }
  });
  
  socket.on('cursor-move', ({ gameId, playerId, cursor }) => {
    socket.to(gameId).emit('cursor-update', { playerId, cursor });
  });
  
  socket.on('evidence-update', ({ gameId, evidence }) => {
    const gameRoom = gameRooms.get(gameId);
    if (gameRoom) {
      gameRoom.evidence = evidence;
      io.to(gameId).emit('evidence-updated', evidence);
    }
  });
  
  socket.on('theory-submit', ({ gameId, theory }) => {
    const gameRoom = gameRooms.get(gameId);
    if (gameRoom) {
      gameRoom.theories.push(theory);
      io.to(gameId).emit('theory-added', theory);
    }
  });
  
  socket.on('vote-theory', ({ gameId, theoryId, playerId }) => {
    const gameRoom = gameRooms.get(gameId);
    if (gameRoom) {
      const theory = gameRoom.theories.find(t => t.id === theoryId);
      if (theory) {
        if (!theory.votes.includes(playerId)) {
          theory.votes.push(playerId);
          io.to(gameId).emit('theory-voted', { theoryId, votes: theory.votes });
        }
      }
    }
  });
  
  socket.on('phase-advance', ({ gameId, newPhase }) => {
    const gameRoom = gameRooms.get(gameId);
    if (gameRoom) {
      gameRoom.currentPhase = newPhase;
      gameRoom.gameState.phase = newPhase;
      io.to(gameId).emit('phase-changed', newPhase);
    }
  });
  
  socket.on('disconnect', () => {
    const playerInfo = activePlayers.get(socket.id);
    if (playerInfo) {
      const { gameId, playerId } = playerInfo;
      const gameRoom = gameRooms.get(gameId);
      
      if (gameRoom) {
        const player = gameRoom.players.find(p => p.id === playerId);
        if (player) {
          player.isOnline = false;
          socket.to(gameId).emit('player-left', player);
        }
      }
      
      activePlayers.delete(socket.id);
    }
    console.log('Player disconnected:', socket.id);
  });
});

// Real incident.io integration
async function fetchIncidentData(incidentId) {
  const { incidentIoService } = require('../lib/incidentIoMcp.ts');
  
  try {
    const incidentData = await incidentIoService.fetchIncident(incidentId);
    console.log('Fetched real incident data:', incidentData.title);
    return incidentData;
  } catch (error) {
    console.error('Failed to fetch incident data:', error);
    // Fallback handled within the service
    throw error;
  }
}

async function generateAIAnalysis(incidentData) {
  // Mock AI analysis (replace with real AI service)
  return {
    briefing: `Detective Inspector Mortem here. We have a curious case of database timeouts that brought down the user API for over 2 hours. The evidence suggests connection pool exhaustion, but the timing is suspicious - why did it happen during low traffic hours? Let's investigate...`,
    
    evidence: [
      {
        id: "evid-1",
        type: "log_entry",
        title: "Database Connection Timeout Logs",
        content: "2024-01-15 14:30:15 ERROR: Connection timeout after 30s\n2024-01-15 14:30:16 ERROR: Max pool size reached (100/100)",
        timestamp: new Date("2024-01-15T14:30:15Z"),
        source: "database-logs",
        category: "system_error",
        isReviewed: false,
        tags: ["timeout", "connection_pool"],
        significance: 9
      },
      {
        id: "evid-2", 
        type: "slack_message",
        title: "Alice's Initial Assessment",
        content: "Looking at database logs now. Seeing connection pool exhaustion.",
        timestamp: new Date("2024-01-15T14:36:00Z"),
        source: "slack",
        category: "witness_statement",
        isReviewed: false,
        tags: ["assessment", "expert_opinion"],
        significance: 7
      }
    ],
    
    suggestedTheories: [
      {
        id: "theory-1",
        title: "Connection Pool Exhaustion",
        description: "Database connection pool reached maximum capacity due to long-running queries",
        rootCause: "Inefficient query causing connection leaks",
        supportingEvidence: ["evid-1"],
        confidence: 85,
        proposedBy: "AI Assistant",
        votes: [],
        aiValidation: {
          score: 85,
          reasoning: "Log evidence strongly supports pool exhaustion theory",
          supportingPatterns: ["Connection timeout errors", "Max pool size reached"],
          contradictions: []
        }
      }
    ],
    
    timelineGaps: [
      "What happened between 14:25-14:30 that triggered the issue?",
      "Why wasn't the connection pool monitoring alert triggered earlier?"
    ],
    
    witnessProfiles: [
      {
        responderId: "resp-1",
        name: "Alice Chen",
        role: "SRE Lead", 
        keyActions: ["First responder", "Database expert", "Applied the fix"],
        personality: "Methodical and experienced",
        availability: true
      }
    ]
  };
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Detective incident.io server running on port ${PORT}`);
});