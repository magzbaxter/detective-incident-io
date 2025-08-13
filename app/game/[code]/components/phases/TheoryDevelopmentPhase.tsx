'use client';

import { useState } from 'react';
import { GameRoom, Player, Theory, GamePhase } from '@/types';
import { Lightbulb, ArrowRight, Plus, ThumbsUp, Brain } from 'lucide-react';

interface TheoryDevelopmentPhaseProps {
  gameRoom: GameRoom;
  currentPlayer: Player;
  onPhaseAdvance: (newPhase: GamePhase) => void;
  onTheorySubmit: (theory: Theory) => void;
}

export function TheoryDevelopmentPhase({
  gameRoom,
  currentPlayer,
  onPhaseAdvance,
  onTheorySubmit
}: TheoryDevelopmentPhaseProps) {
  const [showNewTheoryForm, setShowNewTheoryForm] = useState(false);
  const [newTheory, setNewTheory] = useState({
    title: '',
    description: '',
    rootCause: ''
  });

  const canAdvance = currentPlayer.role === 'lead_detective' || gameRoom.players.length === 1;
  const theories = gameRoom.theories || [];
  const aiTheories = theories.filter(t => t.proposedBy === 'Detective Inspector Mortem');
  const playerTheories = theories.filter(t => t.proposedBy !== 'Detective Inspector Mortem');

  const handleSubmitTheory = () => {
    if (!newTheory.title.trim() || !newTheory.description.trim() || !newTheory.rootCause.trim()) {
      return;
    }

    const theory: Theory = {
      id: `theory-${Date.now()}`,
      title: newTheory.title,
      description: newTheory.description,
      rootCause: newTheory.rootCause,
      supportingEvidence: [], // Players can link evidence in next phase
      confidence: 50, // Default confidence
      proposedBy: currentPlayer.name,
      votes: [currentPlayer.id], // Auto-vote for own theory
      aiValidation: undefined // Will be validated later
    };

    onTheorySubmit(theory);
    setNewTheory({ title: '', description: '', rootCause: '' });
    setShowNewTheoryForm(false);
  };

  const handleAdvancePhase = () => {
    onPhaseAdvance('investigation');
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-detective-dark mb-2 flex items-center gap-3">
              <Lightbulb className="text-detective-gold" />
              Theory Development
            </h2>
            <p className="text-detective-brown">
              Develop theories about the root cause based on the evidence reviewed. 
              Consider AI suggestions and propose your own hypotheses.
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-detective-brown mb-1">
              Total Theories
            </div>
            <div className="text-2xl font-bold text-detective-dark">
              {theories.length}
            </div>
            <div className="text-sm text-detective-brown">
              {aiTheories.length} AI • {playerTheories.length} Team
            </div>
          </div>
        </div>
      </div>

      {/* AI Theories */}
      {aiTheories.length > 0 && (
        <div className="detective-paper rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-detective-dark mb-4 flex items-center gap-2">
            <Brain className="text-detective-brown" />
            Inspector Mortem's Initial Theories
          </h3>
          
          <div className="grid gap-4">
            {aiTheories.map((theory) => (
              <TheoryCard
                key={theory.id}
                theory={theory}
                isAI={true}
                currentPlayer={currentPlayer}
              />
            ))}
          </div>
        </div>
      )}

      {/* Team Theories */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-detective-dark flex items-center gap-2">
            <Lightbulb className="text-detective-brown" />
            Team Theories
          </h3>
          
          {!showNewTheoryForm && (
            <button
              onClick={() => setShowNewTheoryForm(true)}
              className="bg-detective-gold hover:bg-yellow-500 text-detective-dark px-4 py-2 rounded-md font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Propose Theory
            </button>
          )}
        </div>

        {/* New Theory Form */}
        {showNewTheoryForm && (
          <div className="bg-detective-cream rounded-lg p-4 mb-6 border-2 border-detective-gold">
            <h4 className="font-bold text-detective-dark mb-4">Propose New Theory</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-detective-dark font-medium mb-2">
                  Theory Title
                </label>
                <input
                  type="text"
                  placeholder="Brief, descriptive title for your theory"
                  value={newTheory.title}
                  onChange={(e) => setNewTheory({...newTheory, title: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-detective-brown rounded-md focus:outline-none focus:border-detective-gold bg-white"
                />
              </div>
              
              <div>
                <label className="block text-detective-dark font-medium mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Detailed explanation of your theory and reasoning"
                  value={newTheory.description}
                  onChange={(e) => setNewTheory({...newTheory, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-detective-brown rounded-md focus:outline-none focus:border-detective-gold bg-white"
                />
              </div>
              
              <div>
                <label className="block text-detective-dark font-medium mb-2">
                  Root Cause
                </label>
                <textarea
                  placeholder="What you believe was the fundamental root cause"
                  value={newTheory.rootCause}
                  onChange={(e) => setNewTheory({...newTheory, rootCause: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-detective-brown rounded-md focus:outline-none focus:border-detective-gold bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSubmitTheory}
                disabled={!newTheory.title.trim() || !newTheory.description.trim() || !newTheory.rootCause.trim()}
                className="bg-detective-brown hover:bg-detective-dark text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Theory
              </button>
              
              <button
                onClick={() => setShowNewTheoryForm(false)}
                className="text-detective-brown hover:text-detective-dark"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Team Theories List */}
        {playerTheories.length > 0 ? (
          <div className="grid gap-4">
            {playerTheories.map((theory) => (
              <TheoryCard
                key={theory.id}
                theory={theory}
                isAI={false}
                currentPlayer={currentPlayer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-detective-brown">
            <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No team theories yet.</p>
            <p className="text-sm">Be the first to propose a theory based on the evidence!</p>
          </div>
        )}
      </div>

      {/* Phase Navigation */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-detective-dark mb-2">
              Ready to Test Theories?
            </h3>
            <p className="text-detective-brown text-sm">
              Once theories are developed, we can move to the investigation phase to test them against evidence.
            </p>
          </div>
          
          {canAdvance && (
            <button
              onClick={handleAdvancePhase}
              disabled={theories.length === 0}
              className="bg-detective-brown hover:bg-detective-dark text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Begin Investigation
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        
        {!canAdvance && (
          <p className="text-sm text-detective-brown/70 mt-4">
            Only the Lead Detective can advance the investigation phases.
          </p>
        )}
        
        {canAdvance && theories.length === 0 && (
          <p className="text-sm text-detective-red mt-4">
            At least one theory must be developed before proceeding.
          </p>
        )}
      </div>
    </div>
  );
}

function TheoryCard({ 
  theory, 
  isAI, 
  currentPlayer 
}: { 
  theory: Theory; 
  isAI: boolean; 
  currentPlayer: Player; 
}) {
  const hasVoted = theory.votes.includes(currentPlayer.id);
  
  return (
    <div className={`border-2 rounded-lg p-4 ${
      isAI 
        ? 'border-detective-brown bg-detective-brown/5' 
        : 'border-detective-gold bg-detective-gold/5'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-detective-dark text-lg mb-1">
            {theory.title}
          </h4>
          <p className="text-sm text-detective-brown mb-1">
            Proposed by <span className="font-medium">{theory.proposedBy}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {theory.confidence && (
            <div className="text-center">
              <div className="text-sm text-detective-brown">Confidence</div>
              <div className="text-lg font-bold text-detective-dark">
                {theory.confidence}%
              </div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-sm text-detective-brown">Votes</div>
            <div className="flex items-center gap-1">
              <ThumbsUp size={16} className={hasVoted ? 'text-detective-gold' : 'text-detective-brown'} />
              <span className="font-bold text-detective-dark">{theory.votes.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-detective-dark mb-3 leading-relaxed">
        {theory.description}
      </p>
      
      <div className="bg-detective-cream rounded p-3 mb-3">
        <h5 className="font-semibold text-detective-dark mb-1">Root Cause:</h5>
        <p className="text-detective-dark">{theory.rootCause}</p>
      </div>
      
      {theory.aiValidation && (
        <div className="bg-detective-brown/10 rounded p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-detective-brown" />
            <span className="font-semibold text-detective-dark">AI Validation</span>
            <span className="text-sm bg-detective-gold text-detective-dark px-2 py-1 rounded">
              {theory.aiValidation.score}/100
            </span>
          </div>
          <p className="text-detective-dark text-sm">
            {theory.aiValidation.reasoning}
          </p>
        </div>
      )}
    </div>
  );
}