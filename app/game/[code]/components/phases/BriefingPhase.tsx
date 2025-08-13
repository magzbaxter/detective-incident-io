'use client';

import { useState } from 'react';
import { GameRoom, Player, GamePhase } from '@/types';
import { BookOpen, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

interface BriefingPhaseProps {
  gameRoom: GameRoom;
  currentPlayer: Player;
  onPhaseAdvance: (newPhase: GamePhase) => void;
}

export function BriefingPhase({ gameRoom, currentPlayer, onPhaseAdvance }: BriefingPhaseProps) {
  const [briefingRead, setBriefingRead] = useState(false);
  const canAdvance = currentPlayer.role === 'lead_detective' || gameRoom.players.length === 1;

  const handleAdvancePhase = () => {
    onPhaseAdvance('evidence_review');
  };

  const incidentData = gameRoom.incidentData;
  const aiAnalysis = gameRoom.aiAnalysis;

  return (
    <div className="space-y-6">
      {/* Detective Mortem Introduction */}
      <div className="detective-paper rounded-lg p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-detective-brown rounded-full flex items-center justify-center">
            <BookOpen size={24} className="text-detective-cream" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-detective-dark">
              Detective Inspector Mortem
            </h2>
            <p className="text-detective-brown">AI Investigation Assistant</p>
          </div>
        </div>
        
        <div className="typewriter text-detective-dark leading-relaxed">
          <p className="mb-4">
            {aiAnalysis?.briefing || 
            `Greetings, detectives. I am Inspector Mortem, your AI investigation assistant. 
            We have a curious case before us - an incident that requires your collective 
            expertise to unravel. Let me brief you on what we know so far...`}
          </p>
        </div>
      </div>

      {/* Incident Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="detective-paper rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-detective-dark mb-4 flex items-center gap-2">
            <AlertTriangle className="text-detective-red" />
            Case Summary
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-detective-dark">Incident:</span>
              <p className="text-detective-brown">{incidentData?.title || 'Loading...'}</p>
            </div>
            
            <div>
              <span className="font-semibold text-detective-dark">Severity:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                incidentData?.severity === 'high' 
                  ? 'bg-red-100 text-red-800' 
                  : incidentData?.severity === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {incidentData?.severity?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            
            <div>
              <span className="font-semibold text-detective-dark">Duration:</span>
              <p className="text-detective-brown">
                {incidentData?.createdAt && incidentData?.resolvedAt 
                  ? `${formatDuration(incidentData.createdAt, incidentData.resolvedAt)}`
                  : 'Calculating...'
                }
              </p>
            </div>
            
            <div>
              <span className="font-semibold text-detective-dark">Services Affected:</span>
              <p className="text-detective-brown">
                {incidentData?.services?.join(', ') || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <div className="detective-paper rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-detective-dark mb-4 flex items-center gap-2">
            <Clock className="text-detective-brown" />
            Investigation Team
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-detective-dark">Responders:</span>
              <div className="mt-2 space-y-1">
                {incidentData?.responders?.map((responder: any, index: number) => (
                  <div key={index} className="text-sm text-detective-brown">
                    • <span className="font-medium">{responder.name}</span> ({responder.role})
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <span className="font-semibold text-detective-dark">Evidence Sources:</span>
              <div className="mt-2 space-y-1 text-sm text-detective-brown">
                <div>• Incident timeline ({incidentData?.timeline?.length || 0} events)</div>
                <div>• Slack communications ({incidentData?.slackMessages?.length || 0} messages)</div>
                <div>• System logs and metrics</div>
                <div>• Responder actions and decisions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Questions */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-detective-dark mb-4">
          Key Questions to Investigate
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {aiAnalysis?.timelineGaps?.map((gap: string, index: number) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-detective-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-detective-dark text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-detective-dark text-sm">{gap}</p>
            </div>
          )) || [
            <div key={0} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-detective-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-detective-dark text-sm font-bold">1</span>
              </div>
              <p className="text-detective-dark text-sm">What was the root cause of this incident?</p>
            </div>,
            <div key={1} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-detective-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-detective-dark text-sm font-bold">2</span>
              </div>
              <p className="text-detective-dark text-sm">How can we prevent similar incidents in the future?</p>
            </div>
          ]}
        </div>
      </div>

      {/* Ready to Proceed */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-detective-dark mb-2">
              Ready to Begin Investigation?
            </h3>
            <p className="text-detective-brown text-sm">
              Once all detectives have reviewed the briefing, we can proceed to examine the evidence.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-detective-dark">
              <input
                type="checkbox"
                checked={briefingRead}
                onChange={(e) => setBriefingRead(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">I've reviewed the briefing</span>
            </label>
            
            {canAdvance && (
              <button
                onClick={handleAdvancePhase}
                disabled={!briefingRead}
                className="bg-detective-brown hover:bg-detective-dark text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Begin Evidence Review
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
        
        {!canAdvance && (
          <p className="text-sm text-detective-brown/70 mt-4">
            Only the Lead Detective can advance the investigation phases.
          </p>
        )}
      </div>
    </div>
  );
}

function formatDuration(start: Date | string, end: Date | string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m`;
  }
  return `${diffMins} minutes`;
}