'use client';

import { useState } from 'react';
import { PlayerRole } from '@/types';
import { User, Badge, Brain, MessageCircle, FileSearch } from 'lucide-react';

interface JoinGameFormProps {
  gameCode: string;
  onJoin: (playerName: string, role: PlayerRole) => Promise<void>;
  defaultName: string;
}

const ROLES: Array<{
  value: PlayerRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'lead_detective',
    label: 'Lead Detective',
    description: 'Coordinates the investigation and makes final decisions',
    icon: <Badge size={20} />
  },
  {
    value: 'timeline_specialist',
    label: 'Timeline Specialist', 
    description: 'Focuses on reconstructing the sequence of events',
    icon: <FileSearch size={20} />
  },
  {
    value: 'technical_analyst',
    label: 'Technical Analyst',
    description: 'Analyzes logs, metrics, and technical evidence',
    icon: <Brain size={20} />
  },
  {
    value: 'witness_interviewer',
    label: 'Witness Interviewer',
    description: 'Specializes in analyzing responder communications',
    icon: <MessageCircle size={20} />
  },
  {
    value: 'evidence_coordinator',
    label: 'Evidence Coordinator',
    description: 'Organizes and categorizes investigation materials',
    icon: <User size={20} />
  }
];

export function JoinGameForm({ gameCode, onJoin, defaultName }: JoinGameFormProps) {
  const [playerName, setPlayerName] = useState(defaultName);
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('technical_analyst');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    setIsJoining(true);
    try {
      await onJoin(playerName.trim(), selectedRole);
    } catch (error) {
      console.error('Failed to join:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="detective-paper rounded-lg p-8 max-w-2xl shadow-lg transform -rotate-1">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-detective-dark mb-2">
          Join Investigation
        </h1>
        <p className="text-detective-brown">
          Case: <span className="font-mono font-bold">{gameCode}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Player Name */}
        <div>
          <label className="block text-detective-dark font-semibold mb-2">
            Detective Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Inspector Holmes"
            className="w-full px-4 py-3 border-2 border-detective-brown rounded-md focus:outline-none focus:border-detective-gold bg-white"
            required
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-detective-dark font-semibold mb-4">
            Choose Your Role
          </label>
          <div className="grid gap-3">
            {ROLES.map((role) => (
              <label
                key={role.value}
                className={`cursor-pointer border-2 rounded-md p-4 transition-all ${
                  selectedRole === role.value
                    ? 'border-detective-gold bg-detective-gold/10'
                    : 'border-detective-brown/30 hover:border-detective-brown bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value as PlayerRole)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className="text-detective-brown mt-1">
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-detective-dark mb-1">
                      {role.label}
                    </h3>
                    <p className="text-sm text-detective-brown leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!playerName.trim() || isJoining}
          className="w-full bg-detective-brown hover:bg-detective-dark text-white px-6 py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoining ? 'Joining Investigation...' : 'Enter Case File'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-detective-brown/20">
        <p className="text-sm text-detective-brown text-center">
          Once you join, you'll collaborate with other detectives to analyze evidence, 
          develop theories, and generate a comprehensive post-mortem report.
        </p>
      </div>
    </div>
  );
}