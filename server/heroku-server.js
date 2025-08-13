const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

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

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  server.use(cors());
  server.use(express.json());

  // Create new game room
  server.post('/api/games/create', async (req, res) => {
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
      
      const baseUrl = req.get('host').includes('localhost') 
        ? `http://${req.get('host')}` 
        : `https://${req.get('host')}`;
      
      res.json({ 
        gameId, 
        gameCode, 
        joinUrl: `${baseUrl}/game/${gameCode}` 
      });
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({ error: 'Failed to create game' });
    }
  });

  // Join game
  server.post('/api/games/join', (req, res) => {
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

  // WebSocket connections (same as original)
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
          
          socket.to(gameId).emit('player-joined', player);
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

  // Handle Next.js requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Detective incident.io running on port ${PORT}`);
  });
});

// Mock functions
async function fetchIncidentData(incidentId) {
  return {
    id: incidentId,
    title: "Database Connection Timeout",
    description: "Primary database experiencing connection timeouts causing 500 errors",
    severity: "high",
    status: "resolved",
    createdAt: new Date("2024-01-15T14:30:00Z"),
    resolvedAt: new Date("2024-01-15T16:45:00Z"),
    responders: [
      {
        id: "resp-1",
        name: "Alice Chen",
        role: "SRE Lead",
        actions: ["Investigated database logs", "Restarted connection pool", "Applied hotfix"],
        joinedAt: new Date("2024-01-15T14:35:00Z")
      }
    ],
    timeline: [
      {
        id: "evt-1",
        timestamp: new Date("2024-01-15T14:30:00Z"),
        title: "Incident Created",
        description: "Automated alert triggered for high error rate",
        type: "alert"
      }
    ],
    services: ["user-api", "database", "web-frontend"],
    runbooks: ["Database Emergency Response"],
    slackChannel: "#incident-2024-001",
    slackMessages: []
  };
}

async function generateAIAnalysis(incidentData) {
  return {
    briefing: `Detective Inspector Mortem here. We have a curious case of database timeouts...`,
    evidence: [],
    suggestedTheories: []
  };
}