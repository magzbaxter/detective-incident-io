'use client';

import { useState, useEffect } from 'react';
import { GameRoom, Player, PostMortemDraft } from '@/types';
import { FileText, Download, RefreshCw, CheckCircle, Users, Clock } from 'lucide-react';

interface PostMortemPhaseProps {
  gameRoom: GameRoom;
  currentPlayer: Player;
}

export function PostMortemPhase({ gameRoom, currentPlayer }: PostMortemPhaseProps) {
  const [postMortem, setPostMortem] = useState<PostMortemDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const winningTheory = gameRoom.theories?.reduce((prev, current) => 
    (current.votes.length > prev.votes.length) ? current : prev
  );

  useEffect(() => {
    if (!postMortem && winningTheory) {
      generatePostMortem();
    }
  }, [winningTheory]);

  const generatePostMortem = async () => {
    if (!winningTheory || !gameRoom.incidentData) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/postmortem/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameRoom.id,
          incidentData: gameRoom.incidentData,
          finalTheory: winningTheory,
          evidence: gameRoom.evidence,
          players: gameRoom.players
        })
      });

      if (response.ok) {
        const generated = await response.json();
        setPostMortem(generated);
      }
    } catch (error) {
      console.error('Failed to generate post-mortem:', error);
      // Fallback to client-side generation
      setPostMortem(generateMockPostMortem());
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (!postMortem) return;
    
    setIsExporting(true);
    try {
      const response = await fetch('/api/postmortem/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postMortem,
          gameRoom,
          winningTheory
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PostMortem_${gameRoom.code}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      // Fallback: open print dialog
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const generateMockPostMortem = (): PostMortemDraft => ({
    title: `Post-Mortem: ${gameRoom.incidentData?.title || 'Incident Investigation'}`,
    summary: `${gameRoom.incidentData?.description} Investigation conducted by ${gameRoom.players.length} detectives using Detective incident.io collaborative analysis platform.`,
    timeline: generateTimelineText(),
    rootCause: winningTheory?.rootCause || 'Root cause determined through collaborative investigation.',
    impact: generateImpactText(),
    resolution: 'Resolution steps identified through team investigation and evidence analysis.',
    actionItems: [
      {
        id: 'action-1',
        description: 'Implement monitoring improvements based on investigation findings',
        owner: 'SRE Team',
        priority: 'high',
        status: 'open'
      },
      {
        id: 'action-2',
        description: 'Review and update incident response procedures',
        owner: 'Engineering Team', 
        priority: 'medium',
        status: 'open'
      }
    ],
    lessons: [
      'Collaborative investigation improved team understanding of incident',
      'Multiple perspectives led to more comprehensive root cause analysis',
      'Real-time evidence analysis accelerated investigation process'
    ]
  });

  const generateTimelineText = (): string => {
    if (!gameRoom.incidentData?.timeline) return 'Timeline reconstruction in progress...';
    
    return gameRoom.incidentData.timeline
      .slice(0, 5) // Show first 5 events
      .map((event: any) => `${new Date(event.timestamp).toLocaleTimeString()}: ${event.title}`)
      .join('\n');
  };

  const generateImpactText = (): string => {
    const duration = gameRoom.incidentData?.createdAt && gameRoom.incidentData?.resolvedAt 
      ? formatDuration(gameRoom.incidentData.createdAt, gameRoom.incidentData.resolvedAt)
      : 'Duration calculated';
    
    return `Service disruption lasted ${duration}. Impact severity: ${gameRoom.incidentData?.severity || 'assessed'}. Services affected: ${gameRoom.incidentData?.services?.join(', ') || 'multiple services'}.`;
  };

  const formatDuration = (start: Date | string, end: Date | string): string => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins} minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="detective-paper rounded-lg p-8 shadow-lg text-center">
        <div className="w-20 h-20 bg-detective-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText size={40} className="text-detective-dark" />
        </div>
        
        <h2 className="text-3xl font-bold text-detective-dark mb-4">
          Post-Mortem Documentation
        </h2>
        
        <p className="text-detective-brown text-lg leading-relaxed max-w-2xl mx-auto">
          Your collaborative investigation is now complete. The findings have been compiled into a 
          comprehensive post-mortem document ready for stakeholder review and action planning.
        </p>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="detective-paper rounded-lg p-6 shadow-lg text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-detective-brown" size={32} />
          <h3 className="text-lg font-bold text-detective-dark mb-2">
            Generating Post-Mortem Document...
          </h3>
          <p className="text-detective-brown">
            Inspector Mortem is compiling your investigation findings into a professional document.
          </p>
        </div>
      )}

      {/* Post-Mortem Document */}
      {postMortem && (
        <div className="detective-paper rounded-lg shadow-lg">
          <div className="p-6 border-b border-detective-brown/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-detective-dark">
                Generated Post-Mortem Document
              </h3>
              
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="bg-detective-brown hover:bg-detective-dark text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isExporting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6" id="postmortem-content">
            {/* Title */}
            <div className="text-center border-b border-detective-brown/20 pb-6">
              <h1 className="text-2xl font-bold text-detective-dark mb-2">
                {postMortem.title}
              </h1>
              <p className="text-detective-brown">
                Investigation completed {new Date().toLocaleDateString()} by Detective incident.io
              </p>
            </div>

            {/* Executive Summary */}
            <section>
              <h2 className="text-xl font-bold text-detective-dark mb-3 border-b border-detective-gold pb-1">
                Executive Summary
              </h2>
              <p className="text-detective-dark leading-relaxed">
                {postMortem.summary}
              </p>
            </section>

            {/* Timeline */}
            <section>
              <h2 className="text-xl font-bold text-detective-dark mb-3 border-b border-detective-gold pb-1">
                Incident Timeline
              </h2>
              <div className="bg-detective-cream rounded p-4 font-mono text-sm text-detective-dark whitespace-pre-line">
                {postMortem.timeline}
              </div>
            </section>

            {/* Root Cause Analysis */}
            <section>
              <h2 className="text-xl font-bold text-detective-dark mb-3 border-b border-detective-gold pb-1">
                Root Cause Analysis
              </h2>
              
              {winningTheory && (
                <div className="bg-detective-gold/10 border border-detective-gold rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-detective-dark mb-2">
                    Final Determination: {winningTheory.title}
                  </h3>
                  <p className="text-detective-dark mb-3">
                    {winningTheory.description}
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-detective-dark">
                      <span className="font-semibold">Root Cause:</span> {postMortem.rootCause}
                    </p>
                  </div>
                  
                  <div className="mt-3 text-sm text-detective-brown">
                    Team Consensus: {winningTheory.votes.length}/{gameRoom.players.length} detectives
                    {winningTheory.aiValidation && (
                      <span className="ml-4">AI Validation: {winningTheory.aiValidation.score}/100</span>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Impact Assessment */}
            <section>
              <h2 className="text-xl font-bold text-detective-dark mb-3 border-b border-detective-gold pb-1">
                Impact Assessment
              </h2>
              <p className="text-detective-dark leading-relaxed">
                {postMortem.impact}
              </p>
            </section>

            {/* Action Items */}
            <section>
              <h2 className="text-xl font-bold text-detective-dark mb-3 border-b border-detective-gold pb-1">
                Action Items
              </h2>
              <div className="space-y-3">
                {postMortem.actionItems.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-detective-cream rounded">
                    <div className="w-6 h-6 bg-detective-brown text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-detective-dark font-medium mb-1">
                        {item.description}
                      </p>
                      <div className="text-sm text-detective-brown">
                        <span className="font-medium">Owner:</span> {item.owner} • 
                        <span className="font-medium ml-2">Priority:</span> {item.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Lessons Learned */}
            <section>
              <h2 className="text-xl font-bold text-detective-dark mb-3 border-b border-detective-gold pb-1">
                Lessons Learned
              </h2>
              <ul className="space-y-2">
                {postMortem.lessons.map((lesson, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-detective-dark">{lesson}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Investigation Team */}
            <section>
              <h2 className="text-xl font-bold text-detective-dark mb-3 border-b border-detective-gold pb-1">
                Investigation Team
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {gameRoom.players.map(player => (
                  <div key={player.id} className="flex items-center gap-3 p-3 bg-detective-cream rounded">
                    <Users size={16} className="text-detective-brown" />
                    <div>
                      <div className="font-medium text-detective-dark">{player.name}</div>
                      <div className="text-sm text-detective-brown capitalize">
                        {player.role.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-detective-brown/20 pt-6 text-center text-sm text-detective-brown">
              <p>Generated with Detective incident.io • Collaborative Post-Mortem Investigation Platform</p>
              <p className="mt-1">Case {gameRoom.code} • {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="detective-paper rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-detective-dark mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-500" />
          Investigation Complete
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-detective-dark mb-3">What's Next?</h4>
            <ul className="space-y-2 text-sm text-detective-brown">
              <li className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                Export post-mortem as PDF for stakeholder review
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                Share findings with the broader engineering team
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                Schedule follow-up on action items
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                Update incident response procedures based on lessons learned
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-detective-dark mb-3">Investigation Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-detective-brown">Total Time:</span>
                <span className="text-detective-dark font-medium">
                  {formatDuration(gameRoom.createdAt, new Date())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Evidence Items:</span>
                <span className="text-detective-dark font-medium">
                  {(gameRoom.evidence?.length || 0) + (gameRoom.incidentData?.timeline?.length || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Theories Tested:</span>
                <span className="text-detective-dark font-medium">
                  {gameRoom.theories?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-brown">Team Size:</span>
                <span className="text-detective-dark font-medium">
                  {gameRoom.players.length} detectives
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}