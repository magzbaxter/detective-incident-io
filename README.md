# Detective incident.io

A multi-player detective game prototype for incident post-mortems that transforms incident data into collaborative investigations. Teams work together to analyze evidence, develop theories, and generate comprehensive post-mortem documentation.

## 🕵️ Features

### Core Gameplay
- **Multi-player collaboration**: Real-time investigation with WebSocket support
- **Detective roles**: Lead Detective, Timeline Specialist, Technical Analyst, Witness Interviewer, Evidence Coordinator  
- **AI-powered analysis**: Detective Inspector Mortem guides investigations with intelligent insights
- **Evidence system**: Drag-and-drop evidence organization on investigation boards
- **Theory development**: Collaborative hypothesis testing with AI validation
- **Professional output**: Generate comprehensive post-mortems with PDF export

### 🔌 incident.io Integration
- **Real incident data**: Automatic integration via MCP with live incident timelines
- **Automatic game creation**: Games trigger when incidents resolve via webhooks
- **Bidirectional sync**: Post-mortems save back to incident.io with action items
- **Enhanced AI analysis**: Uses real organizational patterns and historical context
- **Graceful fallback**: Works with mock data when incident.io unavailable

### Investigation Phases
1. **Detective Briefing**: AI presents case overview and initial analysis
2. **Evidence Review**: Examine incident data, Slack messages, and system logs
3. **Theory Development**: Propose and discuss potential root causes
4. **Active Investigation**: Test theories against evidence and vote
5. **Drawing Conclusions**: Reach team consensus on final determination
6. **Post-Mortem Generation**: Create professional documentation

### Integration Capabilities (Mock for Prototype)
- **incident.io API**: Fetch comprehensive incident context
- **Slack API**: Retrieve channel messages and communications
- **AI Analysis**: Generate evidence categorization and theory validation
- **PDF Export**: Professional post-mortem documents ready for stakeholder review

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/YOUR_USERNAME/detective-incident-io)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)
- **incident.io API access** (for real incident data)
- **OpenAI API key** (optional - for enhanced AI analysis)

### Installation

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd detective-incident-io
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```
   
   **Required for production:**
   ```bash
   # incident.io Integration
   INCIDENT_IO_API_KEY=your_incident_io_api_key_here
   INCIDENT_IO_BASE_URL=https://api.incident.io
   WEBHOOK_SECRET=your_webhook_secret_here
   
   # Optional: Enhanced AI analysis
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the application (choose one method):**
   
   **Option A: One-click startup (recommended)**
   ```bash
   ./start.sh
   ```
   
   **Option B: Manual startup**
   ```bash
   # Terminal 1: Start the WebSocket server
   npm run server

   # Terminal 2: Start the Next.js development server  
   npm run dev
   ```
   
   **Option C: Concurrent startup**
   ```bash
   npm run dev:all
   ```

4. **Open the application:**
   - Navigate to `http://localhost:3000`
   - Click "Start Demo Investigation" for a quick demo
   - Or create/join games with unique case codes

## 🎮 How to Play

### Starting an Investigation
1. **Demo Mode**: Click "Start Demo Investigation" on the homepage for immediate access
2. **Create Game**: Games auto-generate when incidents resolve (simulated via API)
3. **Join Game**: Enter case code (e.g., "CASE-7X9M") and detective name

### Detective Roles
- **Lead Detective**: Coordinates investigation and advances phases
- **Timeline Specialist**: Focuses on event sequencing and chronology
- **Technical Analyst**: Analyzes logs, metrics, and technical evidence
- **Witness Interviewer**: Reviews communications and responder actions
- **Evidence Coordinator**: Organizes and categorizes investigation materials

### Investigation Process
1. **Review the Briefing**: Read Inspector Mortem's case overview
2. **Examine Evidence**: Search, filter, and organize evidence items
3. **Use the Investigation Board**: Drag evidence to cork board and create connections
4. **Propose Theories**: Develop hypotheses about the root cause
5. **Vote and Validate**: Test theories against evidence with AI assistance
6. **Generate Post-Mortem**: Export professional documentation as PDF

## 🏗️ Technical Architecture

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with custom detective theme
- **React DnD**: Drag-and-drop evidence organization
- **Socket.io Client**: Real-time multiplayer communication

### Backend Stack
- **Express.js**: Web server and API endpoints
- **Socket.io**: WebSocket server for real-time features
- **Puppeteer**: PDF generation for post-mortems
- **OpenAI API**: AI analysis and content generation (optional)

### Key Components
```
app/
├── page.tsx                 # Homepage and game creation
├── game/[code]/            # Game room and investigation phases
├── api/                    # API endpoints for game management
└── components/             # Reusable UI components

server/
└── index.js                # WebSocket server and game logic

lib/
├── aiService.ts            # AI integration and mock analysis  
└── mockApi.ts              # Simulated incident.io and Slack APIs
```

## 🎨 Detective Theme

The application uses a film noir aesthetic with:
- **Color Palette**: Cream backgrounds, brown accents, gold highlights
- **Typography**: Georgia serif fonts for elegance
- **Visual Elements**: Cork board textures, evidence cards, polaroid-style items
- **Interactive Features**: Smooth animations and hover effects

## 🔧 Configuration

### Environment Variables
```bash
# Required for AI features (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Server ports
PORT=3001
WS_PORT=3001
```

### Customization Options
- **Mock Data**: Modify `lib/mockApi.ts` to simulate different incident types
- **AI Responses**: Customize `lib/aiService.ts` for different analysis styles
- **Game Rules**: Adjust voting thresholds and phase requirements in game components
- **Styling**: Update Tailwind config and CSS variables for different themes

## 🧪 Demo Data

The prototype includes realistic mock data:
- **Sample Incident**: Database connection timeout with 2+ hour duration  
- **Real Responders**: Alice Chen (SRE), Bob Martinez (Backend Engineer), Sarah Kim (Product)
- **Slack Messages**: 20+ realistic incident response communications
- **Evidence Items**: Logs, metrics, timeline events, and system changes
- **AI Analysis**: Detective Inspector Mortem's insights and theory validation

## 📱 Responsive Design

- **Desktop**: Full multi-panel layout with sidebar and investigation board
- **Tablet**: Collapsible panels and touch-optimized evidence cards  
- **Mobile**: Single-column layout with swipeable phases

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start Next.js development server
npm run build    # Build production application
npm run start    # Start production server
npm run lint     # Run ESLint
npm run server   # Start WebSocket server
```

### Project Structure
```
detective-incident-io/
├── app/                    # Next.js App Router pages and components
├── components/             # Shared React components  
├── lib/                    # Utility libraries and services
├── server/                 # WebSocket server and game logic
├── types/                  # TypeScript type definitions
├── public/                 # Static assets and images
└── utils/                  # Helper functions
```

### Adding New Features
1. **New Evidence Types**: Add to `types/index.ts` and update evidence components
2. **Additional Phases**: Create new phase components and update game flow
3. **Custom Roles**: Define new detective roles with specific permissions
4. **Integration APIs**: Replace mock services with real API implementations

## 🔌 incident.io MCP Integration

### Real-time Incident Data
The application now integrates directly with incident.io using MCP (Model Context Protocol) for real incident data:

### Setup incident.io Integration

1. **Get your incident.io API key:**
   ```bash
   # Visit https://app.incident.io/settings/api-keys
   # Create a new API key with incident read permissions
   ```

2. **Configure webhook endpoint:**
   ```bash
   # In incident.io settings, add webhook:
   # URL: https://your-domain.com/api/webhooks/incident-resolved
   # Events: incident.resolved
   # Secret: your_webhook_secret_here
   ```

3. **Automatic game creation:**
   ```typescript
   // Games auto-create when incidents resolve
   // Responders get automatic join links
   // Real incident data powers investigations
   ```

### MCP Integration Features

**Real Incident Data:**
- Live incident timelines and updates
- Actual responder actions and roles
- Real service dependencies and impact
- Authentic escalation patterns

**Bidirectional Integration:**
- Post-mortems save back to incident.io
- Action items create follow-up tasks
- Lessons learned update runbooks

**Enhanced AI Analysis:**
- Real organizational patterns
- Historical incident context
- Personalized recommendations

### Manual Game Creation
```bash
# Create game for specific incident
curl -X POST http://localhost:3000/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"incidentId": "01ARZ3NDEKTSV4RRFFQ69G5FAV"}'
```

### Integration Fallback
Without API keys, the app automatically falls back to comprehensive mock data, ensuring it works for demos and development.

### Production Deployment
1. **Database**: Add persistent storage for game state
2. **Authentication**: Implement user accounts and permissions
3. **Monitoring**: Add error tracking and performance monitoring
4. **Scaling**: Configure WebSocket scaling for multiple servers

## 🎯 Use Cases

### Post-Incident Analysis
- **Collaborative Investigation**: Multiple team members analyze evidence together
- **Documentation Generation**: Automatic post-mortem creation with action items
- **Knowledge Sharing**: Learning from past incidents through gamification

### Training & Education
- **Incident Response Training**: Practice with historical incidents
- **New Team Member Onboarding**: Learn incident analysis through gameplay
- **Process Improvement**: Identify gaps in incident response procedures

### Team Building
- **Remote Collaboration**: Engaging way for distributed teams to work together
- **Cross-Functional Learning**: Different roles provide unique perspectives
- **Retrospective Reviews**: Fun approach to reviewing past incidents

## 🐛 Known Limitations

This is a prototype with the following constraints:
- **In-Memory Storage**: Game state not persisted between server restarts
- **Mock Integrations**: Simulated incident.io and Slack data
- **Limited PDF Export**: Basic PDF generation (requires Puppeteer setup)
- **No Authentication**: Open access without user accounts
- **Single Server**: No horizontal scaling or load balancing

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request with clear description

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the troubleshooting section below
2. Review existing GitHub issues
3. Create a new issue with detailed reproduction steps

## 🔧 Troubleshooting

### Common Issues

**WebSocket Connection Failed**
```bash
# Ensure server is running on correct port
npm run server
# Check localhost:3001 is accessible
```

**PDF Export Not Working** 
```bash
# Install Puppeteer dependencies
npm install puppeteer
# For Linux: install Chrome dependencies
sudo apt-get install chromium-browser
```

**AI Features Unavailable**
```bash
# Add OpenAI API key to .env.local
OPENAI_API_KEY=your_key_here
# Or use mock data (default behavior)
```

**Game Code Not Found**
- Games are stored in memory and reset on server restart
- Create new demo game if existing codes don't work
- Check server logs for game creation errors

---

**Detective incident.io** - Making incident post-mortems engaging and collaborative! 🕵️‍♀️