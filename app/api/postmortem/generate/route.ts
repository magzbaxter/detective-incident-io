import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { incidentIoService } from '@/lib/incidentIoMcp';
import { IncidentData, Theory, Evidence, PostMortemDraft } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { incidentData, finalTheory, evidence, players } = await request.json();

    if (!incidentData || !finalTheory) {
      return NextResponse.json(
        { error: 'Incident data and final theory are required' },
        { status: 400 }
      );
    }

    // Generate post-mortem using AI service
    let postMortem: PostMortemDraft;
    
    try {
      postMortem = await aiService.generatePostMortem(
        incidentData as IncidentData,
        finalTheory as Theory,
        evidence as Evidence[]
      );
    } catch (error) {
      console.warn('AI post-mortem generation failed, using fallback:', error);
      postMortem = generateFallbackPostMortem(incidentData, finalTheory, evidence, players);
    }

    // Attempt to save post-mortem back to incident.io
    if (incidentData.id && finalTheory) {
      try {
        const saved = await incidentIoService.savePostMortem(incidentData.id, postMortem);
        if (saved) {
          console.log(`Post-mortem saved to incident.io for incident ${incidentData.id}`);
          postMortem.savedToIncidentIo = true;
        }
      } catch (saveError) {
        console.warn('Failed to save post-mortem to incident.io:', saveError);
        // Continue without failing the entire request
      }
    }

    return NextResponse.json(postMortem);
  } catch (error) {
    console.error('Error generating post-mortem:', error);
    return NextResponse.json(
      { error: 'Failed to generate post-mortem' },
      { status: 500 }
    );
  }
}

function generateFallbackPostMortem(
  incidentData: IncidentData,
  finalTheory: Theory,
  evidence: Evidence[],
  players: any[]
): PostMortemDraft {
  const formatDuration = (start: Date | string, end: Date | string): string => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins} minutes`;
  };

  const duration = incidentData.createdAt && incidentData.resolvedAt 
    ? formatDuration(incidentData.createdAt, incidentData.resolvedAt)
    : 'Unknown duration';

  return {
    title: `Post-Mortem: ${incidentData.title}`,
    
    summary: `${incidentData.description || 'Incident investigation completed'}. The incident lasted ${duration} with ${incidentData.severity || 'unknown'} severity. Through collaborative investigation using Detective incident.io, the team identified the root cause and developed actionable prevention measures.`,
    
    timeline: generateTimelineSection(incidentData),
    
    rootCause: finalTheory.rootCause,
    
    impact: `Service disruption lasted ${duration}. Severity level: ${incidentData.severity || 'assessed'}. Affected services: ${incidentData.services?.join(', ') || 'multiple services'}. The incident was resolved through coordinated team response and systematic investigation.`,
    
    resolution: `Resolution achieved through: ${finalTheory.description}. The investigation team worked collaboratively to identify the root cause and implement fixes. Key responders: ${incidentData.responders?.map(r => `${r.name} (${r.role})`).join(', ') || 'Investigation team'}.`,
    
    actionItems: [
      {
        id: 'action-1',
        description: 'Implement monitoring and alerting improvements to detect similar issues earlier',
        owner: 'SRE Team',
        priority: 'high',
        status: 'open'
      },
      {
        id: 'action-2',
        description: 'Update incident response procedures based on lessons learned',
        owner: 'Engineering Team',
        priority: 'medium', 
        status: 'open'
      },
      {
        id: 'action-3',
        description: 'Conduct team review of root cause prevention measures',
        owner: 'Team Lead',
        priority: 'medium',
        status: 'open'
      }
    ],
    
    lessons: [
      'Collaborative investigation improved team understanding of the incident',
      'Real-time evidence analysis accelerated root cause identification',
      'Multiple team perspectives led to more comprehensive solutions',
      'Detective incident.io facilitated effective remote incident investigation',
      'Systematic theory testing prevented premature conclusions'
    ]
  };
}

function generateTimelineSection(incidentData: IncidentData): string {
  if (!incidentData.timeline || incidentData.timeline.length === 0) {
    return 'Timeline reconstruction in progress...';
  }

  return incidentData.timeline
    .slice(0, 10) // Show first 10 events
    .map(event => {
      const time = new Date(event.timestamp).toLocaleTimeString();
      const date = new Date(event.timestamp).toLocaleDateString();
      return `${date} ${time}: ${event.title}\n   ${event.description}`;
    })
    .join('\n\n');
}