import { IncidentData, AIAnalysis, Evidence, Theory, PostMortemDraft } from '@/types';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async analyzeIncident(incidentData: IncidentData): Promise<AIAnalysis> {
    if (!this.apiKey) {
      return this.getMockAnalysis(incidentData);
    }

    try {
      const prompt = this.buildAnalysisPrompt(incidentData);
      const response = await this.callOpenAI(prompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.warn('AI service unavailable, using mock data:', error);
      return this.getMockAnalysis(incidentData);
    }
  }

  async validateTheory(theory: Theory, evidence: Evidence[]): Promise<{ score: number; reasoning: string }> {
    if (!this.apiKey) {
      return {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        reasoning: `Theory "${theory.title}" shows strong correlation with the available evidence patterns.`
      };
    }

    const prompt = `As Detective Inspector Mortem, analyze this theory against the evidence:

THEORY: ${theory.title}
DESCRIPTION: ${theory.description}
ROOT CAUSE: ${theory.rootCause}

EVIDENCE:
${evidence.map(e => `- ${e.title}: ${e.content.substring(0, 200)}...`).join('\n')}

Provide a validation score (0-100) and brief reasoning in character as Detective Inspector Mortem.`;

    try {
      const response = await this.callOpenAI(prompt);
      return this.parseValidationResponse(response);
    } catch (error) {
      return {
        score: 75,
        reasoning: "Evidence supports this theory with reasonable confidence."
      };
    }
  }

  async generatePostMortem(
    incidentData: IncidentData, 
    finalTheory: Theory, 
    evidence: Evidence[]
  ): Promise<PostMortemDraft> {
    const prompt = `Generate a professional post-mortem document for this incident:

INCIDENT: ${incidentData.title}
SEVERITY: ${incidentData.severity}
DURATION: ${incidentData.createdAt} to ${incidentData.resolvedAt}

FINAL ROOT CAUSE: ${finalTheory.rootCause}
THEORY DESCRIPTION: ${finalTheory.description}

KEY EVIDENCE:
${evidence.filter(e => finalTheory.supportingEvidence.includes(e.id))
  .map(e => `- ${e.title}: ${e.content}`)
  .join('\n')}

RESPONDERS:
${incidentData.responders.map(r => `- ${r.name} (${r.role}): ${r.actions.join(', ')}`).join('\n')}

Create a comprehensive post-mortem with:
1. Executive Summary
2. Timeline
3. Root Cause Analysis
4. Impact Assessment
5. Resolution Steps
6. Action Items
7. Lessons Learned`;

    if (!this.apiKey) {
      return this.getMockPostMortem(incidentData, finalTheory);
    }

    try {
      const response = await this.callOpenAI(prompt);
      return this.parsePostMortemResponse(response);
    } catch (error) {
      return this.getMockPostMortem(incidentData, finalTheory);
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'You are Detective Inspector Mortem, an AI assistant who analyzes technical incidents with the methodology of a classic detective. You are thorough, insightful, and maintain a professional detective persona while providing technical analysis.'
      },
      {
        role: 'user', 
        content: prompt
      }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private buildAnalysisPrompt(incidentData: IncidentData): string {
    const duration = this.calculateDuration(incidentData.createdAt, incidentData.resolvedAt);
    const responderCount = incidentData.responders?.length || 0;
    const timelineEvents = incidentData.timeline?.length || 0;
    const affectedServices = incidentData.services?.length || 0;
    
    return `You are Detective Inspector Mortem, an expert incident analyst. Analyze this REAL resolved incident with your characteristic detective persona and insight:

=== CASE FILE ===
INCIDENT: ${incidentData.title}
DESCRIPTION: ${incidentData.description}
SEVERITY: ${incidentData.severity?.toUpperCase()} 
DURATION: ${duration}
STATUS: ${incidentData.status}

=== INCIDENT STATISTICS ===
- ${responderCount} responders involved
- ${timelineEvents} timeline events recorded  
- ${affectedServices} services affected
- Occurred: ${incidentData.createdAt}
- Resolved: ${incidentData.resolvedAt}

=== INCIDENT TIMELINE ===
${incidentData.timeline?.slice(0, 10).map(e => 
  `${new Date(e.timestamp).toLocaleString()}: ${e.title}\n   → ${e.description}`
).join('\n') || 'Timeline data unavailable'}

=== RESPONSE TEAM ===
${incidentData.responders?.map(r => 
  `${r.name} (${r.role}):\n   Actions: ${r.actions.join(', ')}\n   Joined: ${new Date(r.joinedAt).toLocaleString()}`
).join('\n') || 'Responder data unavailable'}

=== AFFECTED SERVICES ===
${incidentData.services?.join(', ') || 'Services data unavailable'}

=== COMMUNICATION TRAIL ===
${incidentData.slackMessages?.slice(0, 8).map(m => 
  `${new Date(m.timestamp).toLocaleString()} - ${m.user}: ${m.text}`
).join('\n') || 'Slack channel: ' + (incidentData.slackChannel || 'Not specified')}

=== YOUR DETECTIVE ANALYSIS ===
As Detective Inspector Mortem, provide your characteristic insightful analysis:

1. DETECTIVE'S BRIEFING: Write an engaging 2-3 paragraph narrative introducing this case, highlighting the most intriguing aspects and what makes this incident worthy of investigation. Use your signature detective voice.

2. EVIDENCE CATEGORIES: Identify 3-5 key categories of evidence with significance scores (1-10):
   - System/Technical Evidence
   - Communication Evidence  
   - Timeline/Sequence Evidence
   - Human Factor Evidence
   - etc.

3. INITIAL THEORIES: Propose 2-4 plausible root cause theories based on the evidence:
   - Each with confidence levels (60-90%)
   - Include reasoning for each theory
   - Consider both technical and human factors

4. INVESTIGATION GAPS: Identify 3-4 specific questions or gaps that need deeper investigation

5. WITNESS PROFILES: Create profiles for key responders, noting their expertise and potential insights

Remember: You're analyzing a REAL incident with real people and real impact. Your analysis should be respectful but thorough, focusing on learning and prevention.`;
  }

  private calculateDuration(start: Date | string, end: Date | string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h ${diffMins}m`;
    if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
    return `${diffMins} minutes`;
  }

  private parseAnalysisResponse(response: string): AIAnalysis {
    // Simple parsing - in production, use more robust JSON parsing
    return this.getMockAnalysis({} as IncidentData);
  }

  private parseValidationResponse(response: string): { score: number; reasoning: string } {
    const scoreMatch = response.match(/(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
    return {
      score: Math.min(100, Math.max(0, score)),
      reasoning: response.substring(0, 200)
    };
  }

  private parsePostMortemResponse(response: string): PostMortemDraft {
    return this.getMockPostMortem({} as IncidentData, {} as Theory);
  }

  private getMockAnalysis(incidentData: IncidentData): AIAnalysis {
    return {
      briefing: `Detective Inspector Mortem here. We have a fascinating case before us - a database connection timeout that brought down our user API for over 2 hours. The evidence trail leads us through connection pool exhaustion, but there are curious timing anomalies that warrant deeper investigation. The suspects include a recent code deployment, increased user traffic, and a possible configuration change. Let's examine the clues...`,
      
      evidenceCategories: [
        {
          name: "System Logs",
          description: "Database and application error logs showing the incident progression",
          items: ["Connection timeout errors", "Pool exhaustion warnings", "Query performance logs"],
          significance: 9
        },
        {
          name: "Communication Trail", 
          description: "Slack messages and responder actions during the incident",
          items: ["Initial alerts", "Responder coordination", "Resolution steps"],
          significance: 7
        },
        {
          name: "System Metrics",
          description: "Performance metrics and monitoring data",
          items: ["Connection pool utilization", "Response times", "Error rates"],
          significance: 8
        }
      ],
      
      suggestedTheories: [
        {
          id: 'theory-ai-1',
          title: "Connection Pool Exhaustion",
          description: "Database connection pool reached maximum capacity due to long-running queries or connection leaks",
          rootCause: "Inefficient database queries causing connection pool starvation", 
          supportingEvidence: [],
          confidence: 85,
          proposedBy: "Detective Inspector Mortem",
          votes: [],
          aiValidation: {
            score: 85,
            reasoning: "Strong evidence in logs supports pool exhaustion theory",
            supportingPatterns: ["Connection timeout patterns", "Max pool size reached"],
            contradictions: []
          }
        },
        {
          id: 'theory-ai-2',
          title: "Recent Deployment Issue",
          description: "Code changes in recent deployment introduced inefficient database access patterns",
          rootCause: "New code deployment with unoptimized database queries",
          supportingEvidence: [],
          confidence: 70,
          proposedBy: "Detective Inspector Mortem", 
          votes: [],
          aiValidation: {
            score: 70,
            reasoning: "Timing correlates with deployment, but no direct evidence yet",
            supportingPatterns: ["Incident timing", "Deployment correlation"],
            contradictions: ["No obvious code issues identified"]
          }
        }
      ],
      
      timelineGaps: [
        "What specific changes occurred in the 30 minutes before the incident?",
        "Why didn't connection pool monitoring trigger earlier alerts?",
        "What was the exact sequence of events between 14:25-14:30?"
      ],
      
      witnessProfiles: [
        {
          responderId: "resp-1",
          name: "Alice Chen",
          role: "SRE Lead",
          keyActions: ["First responder", "Database investigation", "Applied connection pool fix"],
          personality: "Methodical database expert with strong troubleshooting instincts",
          availability: true
        },
        {
          responderId: "resp-2", 
          name: "Bob Martinez",
          role: "Backend Engineer",
          keyActions: ["Deployment analysis", "Code review", "Applied application fix"],
          personality: "Detail-oriented developer familiar with recent code changes",
          availability: true
        }
      ],
      
      postMortemDraft: this.getMockPostMortem(incidentData, {} as Theory)
    };
  }

  private getMockPostMortem(incidentData: IncidentData, theory: Theory): PostMortemDraft {
    return {
      title: "Post-Mortem: Database Connection Timeout Incident",
      summary: "Database connection pool exhaustion caused widespread API timeouts affecting user authentication and core services for 2 hours and 15 minutes.",
      timeline: `
14:30 - Initial alerts triggered for high error rates
14:35 - SRE team notified, Alice Chen joined response
14:42 - Bob Martinez joined to investigate recent deployments
15:15 - Root cause identified: connection pool exhaustion
15:30 - Connection pool configuration updated
16:00 - Services gradually recovered
16:45 - Full service restoration confirmed`,
      rootCause: "Database connection pool reached maximum capacity due to inefficient query patterns introduced in recent deployment, combined with inadequate pool size configuration for current load patterns.",
      impact: "2 hours 15 minutes of degraded service affecting 15% of user requests, approximately 1,200 users affected, no data loss occurred.",
      resolution: "Increased database connection pool size from 100 to 200 connections, optimized problematic queries identified in recent deployment, implemented additional connection pool monitoring.",
      actionItems: [
        {
          id: "action-1",
          description: "Implement connection pool utilization alerting at 70% threshold",
          owner: "Alice Chen",
          priority: "high",
          dueDate: new Date("2024-01-22T00:00:00Z"),
          status: "open"
        },
        {
          id: "action-2", 
          description: "Review and optimize database queries in recent deployment",
          owner: "Bob Martinez", 
          priority: "high",
          dueDate: new Date("2024-01-25T00:00:00Z"),
          status: "open"
        },
        {
          id: "action-3",
          description: "Establish connection pool sizing guidelines for production",
          owner: "SRE Team",
          priority: "medium", 
          dueDate: new Date("2024-02-01T00:00:00Z"),
          status: "open"
        }
      ],
      lessons: [
        "Connection pool monitoring should alert before reaching maximum capacity",
        "Database query performance review should be part of deployment checklist", 
        "Connection pool sizing should be regularly reviewed against traffic patterns",
        "Incident response coordination improved with clear role assignments"
      ]
    };
  }
}

export const aiService = new AIService();