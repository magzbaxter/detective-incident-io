'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, FileText, Clock } from 'lucide-react';

export default function HomePage() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinGame = async () => {
    if (!gameCode.trim() || !playerName.trim()) return;
    
    setIsLoading(true);
    try {
      // Navigate to game page
      router.push(`/game/${gameCode.toUpperCase()}?player=${encodeURIComponent(playerName)}`);
    } catch (error) {
      console.error('Failed to join game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDemo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: 'demo-incident-001' })
      });
      
      if (response.ok) {
        const { gameCode } = await response.json();
        router.push(`/game/${gameCode}?player=Detective&demo=true`);
      }
    } catch (error) {
      console.error('Failed to create demo game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-cream via-yellow-50 to-detective-cream">
      {/* Header */}
      <header className="text-center py-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Search size={48} className="text-detective-brown" />
          <h1 className="text-5xl font-bold text-detective-dark font-detective">
            Detective incident.io
          </h1>
        </div>
        <p className="text-xl text-detective-brown max-w-2xl mx-auto leading-relaxed">
          A collaborative detective game that transforms incident post-mortems into engaging investigations. 
          Work together to uncover root causes and generate professional documentation.
        </p>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6">
        {/* Join Game Section */}
        <div className="detective-paper rounded-lg p-8 mb-12 shadow-lg transform -rotate-1">
          <h2 className="text-3xl font-bold text-detective-dark mb-6 flex items-center gap-3">
            <Users className="text-detective-brown" />
            Join an Investigation
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-detective-dark font-semibold mb-2">
                Game Code
              </label>
              <input
                type="text"
                placeholder="CASE-7X9M"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-detective-brown rounded-md focus:outline-none focus:border-detective-gold bg-white"
                maxLength={9}
              />
            </div>
            
            <div>
              <label className="block text-detective-dark font-semibold mb-2">
                Detective Name
              </label>
              <input
                type="text"
                placeholder="Inspector Holmes"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-detective-brown rounded-md focus:outline-none focus:border-detective-gold bg-white"
              />
            </div>
          </div>
          
          <button
            onClick={handleJoinGame}
            disabled={!gameCode.trim() || !playerName.trim() || isLoading}
            className="mt-6 bg-detective-brown hover:bg-detective-dark text-white px-8 py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Joining Case...' : 'Join Investigation'}
          </button>
        </div>

        {/* Demo Section */}
        <div className="detective-paper rounded-lg p-8 mb-12 shadow-lg transform rotate-1">
          <h2 className="text-3xl font-bold text-detective-dark mb-6 flex items-center gap-3">
            <FileText className="text-detective-brown" />
            Try a Demo Case
          </h2>
          
          <p className="text-detective-dark mb-6 leading-relaxed">
            Experience Detective incident.io with our sample database timeout incident. 
            Investigate real Slack messages, analyze logs, and collaborate with AI to generate a professional post-mortem.
          </p>
          
          <button
            onClick={handleCreateDemo}
            disabled={isLoading}
            className="bg-detective-gold hover:bg-yellow-500 text-detective-dark px-8 py-3 rounded-md font-semibold transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Demo...' : 'Start Demo Investigation'}
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Users size={32} />}
            title="Multi-Player Collaboration"
            description="Work together in real-time with your incident response team to investigate and analyze."
          />
          
          <FeatureCard
            icon={<Search size={32} />}
            title="AI-Powered Analysis"
            description="Detective Inspector Mortem guides your investigation with intelligent evidence analysis."
          />
          
          <FeatureCard
            icon={<FileText size={32} />}
            title="Professional Output"
            description="Generate comprehensive post-mortems with action items, ready for stakeholder review."
          />
        </div>

        {/* How It Works */}
        <div className="detective-paper rounded-lg p-8 mb-12 shadow-lg">
          <h2 className="text-3xl font-bold text-detective-dark mb-6 flex items-center gap-3">
            <Clock className="text-detective-brown" />
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <StepItem
                number="1"
                title="Incident Resolution"
                description="When an incident is resolved in incident.io, a game automatically triggers."
              />
              <StepItem
                number="2"
                title="Evidence Collection"
                description="AI analyzes incident data, Slack messages, and timeline to create investigation materials."
              />
              <StepItem
                number="3"
                title="Team Investigation"
                description="Responders join the game and collaborate to review evidence and develop theories."
              />
            </div>
            
            <div className="space-y-4">
              <StepItem
                number="4"
                title="Root Cause Analysis"
                description="Work together to determine the true root cause with AI validation and guidance."
              />
              <StepItem
                number="5"
                title="Post-Mortem Generation"
                description="Generate a comprehensive post-mortem document with action items and lessons learned."
              />
              <StepItem
                number="6"
                title="Professional Export"
                description="Export your investigation results as a polished PDF ready for stakeholder review."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-detective-brown">
        <p>Detective incident.io - Making post-mortems engaging and collaborative</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-detective-brown/20 hover:shadow-lg transition-shadow">
      <div className="text-detective-brown mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-detective-dark mb-3 text-center">
        {title}
      </h3>
      <p className="text-detective-dark text-center leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StepItem({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-detective-brown text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-detective-dark mb-1">{title}</h4>
        <p className="text-detective-dark text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}