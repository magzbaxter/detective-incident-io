#!/bin/bash

echo "🕵️ Starting Detective incident.io with incident.io MCP Integration..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env.local exists, if not copy from example
if [ ! -f ".env.local" ]; then
    echo "⚙️ Setting up environment configuration..."
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo "💡 You can edit .env.local to add your OpenAI API key (optional)"
    echo ""
fi

echo "🚀 Starting Detective incident.io servers..."
echo ""
echo "📍 Application will be available at: http://localhost:3000"
echo "📍 WebSocket server will run on: http://localhost:3001" 
echo ""
echo "🎮 To play:"
echo "   1. Click 'Start Demo Investigation' for immediate access"
echo "   2. Or create/join games with unique case codes"
echo "   3. Add incident.io API key for real incident data (see SETUP_INCIDENT_IO.md)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
npm run dev:all