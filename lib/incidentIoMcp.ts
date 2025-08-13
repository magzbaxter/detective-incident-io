import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { IncidentData, Responder, TimelineEvent, SlackMessage } from '@/types';

interface IncidentIoConfig {
  apiKey?: string;
  baseUrl?: string;
}

class IncidentIoMCPService {
  private client: Client | null = null;
  private apiKey: string;
  private baseUrl: string;
  private isConnected = false;

  constructor(config: IncidentIoConfig = {}) {
    this.apiKey = config.apiKey || process.env.INCIDENT_IO_API_KEY || '';
    this.baseUrl = config.baseUrl || process.env.INCIDENT_IO_BASE_URL || 'https://api.incident.io';
  }

  async initialize(): Promise<void> {
    if (this.isConnected || !this.apiKey) {
      return;
    }

    try {
      // Initialize MCP client
      const transport = new StdioClientTransport({
        command: 'incident-io-mcp',
        args: ['--api-key', this.apiKey]
      });

      this.client = new Client(
        {
          name: 'detective-incident-io',
          version: '1.0.0'
        },
        {
          capabilities: {
            resources: {},
            tools: {},
            prompts: {}
          }
        }
      );

      await this.client.connect(transport);
      this.isConnected = true;
      console.log('Connected to incident.io MCP');
    } catch (error) {
      console.warn('Failed to initialize MCP client, falling back to REST API:', error);
      this.isConnected = false;
    }
  }

  async fetchIncident(incidentId: string): Promise<IncidentData> {
    await this.initialize();

    if (this.client && this.isConnected) {
      return this.fetchIncidentViaMCP(incidentId);
    } else {
      return this.fetchIncidentViaRestAPI(incidentId);
    }
  }

  private async fetchIncidentViaMCP(incidentId: string): Promise<IncidentData> {
    if (!this.client) throw new Error('MCP client not initialized');

    try {
      // Use MCP to fetch incident data
      const result = await this.client.callTool({
        name: 'get_incident',
        arguments: {
          incident_id: incidentId,
          include: ['timeline', 'responders', 'updates', 'custom_fields']
        }
      });

      const incidentData = (result.content as any)?.[0] || {};
      return this.transformMCPIncidentData(incidentData);
    } catch (error) {
      console.error('MCP fetch failed, falling back to REST API:', error);
      return this.fetchIncidentViaRestAPI(incidentId);
    }
  }

  private async fetchIncidentViaRestAPI(incidentId: string): Promise<IncidentData> {
    if (!this.apiKey) {
      console.warn('No incident.io API key provided, using mock data');
      return this.getMockIncidentData(incidentId);
    }

    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };

      // Fetch main incident data
      const incidentResponse = await fetch(`${this.baseUrl}/v2/incidents/${incidentId}`, {
        headers
      });

      if (!incidentResponse.ok) {
        throw new Error(`Failed to fetch incident: ${incidentResponse.statusText}`);
      }

      const incident = await incidentResponse.json();

      // Fetch timeline
      const timelineResponse = await fetch(`${this.baseUrl}/v2/incidents/${incidentId}/timeline`, {
        headers
      });

      let timeline = [];
      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        timeline = timelineData.timeline_entries || [];
      }

      // Fetch actions (responder activities)
      const actionsResponse = await fetch(`${this.baseUrl}/v2/incidents/${incidentId}/actions`, {
        headers
      });

      let actions = [];
      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json();
        actions = actionsData.actions || [];
      }

      return this.transformRestAPIIncidentData(incident.incident, timeline, actions);
    } catch (error) {
      console.error('incident.io REST API failed, using mock data:', error);
      return this.getMockIncidentData(incidentId);
    }
  }

  private transformMCPIncidentData(mcpData: any): IncidentData {
    // Transform MCP response to our IncidentData format
    return {
      id: mcpData.id,
      title: mcpData.name || mcpData.summary || 'Untitled Incident',
      description: mcpData.summary || mcpData.description || '',
      severity: this.mapSeverity(mcpData.severity),
      status: mcpData.status || 'resolved',
      createdAt: new Date(mcpData.created_at),
      resolvedAt: mcpData.resolved_at ? new Date(mcpData.resolved_at) : new Date(),
      responders: this.transformResponders(mcpData.responders || mcpData.roles || []),
      timeline: this.transformTimeline(mcpData.timeline || []),
      services: this.extractServices(mcpData.affected_services || mcpData.services || []),
      runbooks: this.extractRunbooks(mcpData.actions || []),
      slackChannel: mcpData.slack_channel_id || mcpData.channel || '',
      slackMessages: [] // Will be populated separately if available
    };
  }

  private transformRestAPIIncidentData(incident: any, timeline: any[], actions: any[]): IncidentData {
    return {
      id: incident.id,
      title: incident.name || incident.summary || 'Untitled Incident',
      description: incident.summary || incident.description || '',
      severity: this.mapSeverity(incident.severity),
      status: incident.status || 'resolved',
      createdAt: new Date(incident.created_at),
      resolvedAt: incident.resolved_at ? new Date(incident.resolved_at) : new Date(),
      responders: this.transformResponders(incident.roles || []),
      timeline: this.transformTimeline(timeline),
      services: this.extractServices(incident.affected_services || []),
      runbooks: this.extractRunbooks(actions),
      slackChannel: incident.slack_channel_id || '',
      slackMessages: [] // Slack messages would need separate API calls
    };
  }

  private mapSeverity(severity: any): 'low' | 'medium' | 'high' | 'critical' {
    if (!severity) return 'medium';
    
    const severityName = typeof severity === 'object' ? severity.name || severity.description : severity;
    const severityStr = severityName.toLowerCase();
    
    if (severityStr.includes('critical') || severityStr.includes('p0')) return 'critical';
    if (severityStr.includes('high') || severityStr.includes('p1')) return 'high';
    if (severityStr.includes('low') || severityStr.includes('p3') || severityStr.includes('p4')) return 'low';
    return 'medium';
  }

  private transformResponders(roles: any[]): Responder[] {
    return roles.map((role, index) => {
      const user = role.user || role.assignee || {};
      return {
        id: role.id || `responder-${index}`,
        name: user.name || user.email || `Responder ${index + 1}`,
        role: role.role_type?.name || role.type || 'Responder',
        actions: this.extractUserActions(role),
        joinedAt: new Date(role.created_at || role.assigned_at || new Date())
      };
    });
  }

  private transformTimeline(timeline: any[]): TimelineEvent[] {
    return timeline.map((entry, index) => ({
      id: entry.id || `timeline-${index}`,
      timestamp: new Date(entry.occurred_at || entry.created_at),
      title: entry.event_type || entry.type || 'Timeline Event',
      description: entry.body || entry.description || entry.summary || '',
      type: entry.event_type || 'event',
      actor: entry.actor?.name || entry.user?.name
    }));
  }

  private extractServices(services: any[]): string[] {
    return services.map(service => 
      typeof service === 'string' ? service : service.name || service.summary
    );
  }

  private extractRunbooks(actions: any[]): string[] {
    const runbooks = new Set<string>();
    
    actions.forEach(action => {
      if (action.action_type === 'runbook' || action.type === 'runbook') {
        runbooks.add(action.description || action.summary || 'Runbook');
      }
    });
    
    return Array.from(runbooks);
  }

  private extractUserActions(role: any): string[] {
    const actions = [];
    
    if (role.actions) {
      actions.push(...role.actions.map((a: any) => a.description || a.summary));
    }
    
    // Default actions based on role type
    const roleType = role.role_type?.name || role.type || '';
    if (roleType.toLowerCase().includes('lead')) {
      actions.push('Led incident response', 'Coordinated team activities');
    } else if (roleType.toLowerCase().includes('engineer')) {
      actions.push('Investigated technical issues', 'Implemented fixes');
    }
    
    return actions.length > 0 ? actions : ['Participated in incident response'];
  }

  async savePostMortem(incidentId: string, postMortem: any): Promise<boolean> {
    await this.initialize();

    try {
      if (this.client && this.isConnected) {
        // Use MCP to save post-mortem
        await this.client.callTool({
          name: 'create_postmortem',
          arguments: {
            incident_id: incidentId,
            content: postMortem.summary,
            action_items: postMortem.actionItems.map((item: any) => ({
              description: item.description,
              assignee: item.owner,
              due_date: item.dueDate
            }))
          }
        });
        return true;
      } else if (this.apiKey) {
        // Use REST API to save post-mortem
        const response = await fetch(`${this.baseUrl}/v2/incidents/${incidentId}/postmortem`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: postMortem.summary,
            content: postMortem,
            action_items: postMortem.actionItems
          })
        });
        return response.ok;
      }
    } catch (error) {
      console.error('Failed to save post-mortem to incident.io:', error);
    }
    
    return false;
  }

  private getMockIncidentData(incidentId: string): IncidentData {
    // Fallback to existing mock data when incident.io is unavailable
    return {
      id: incidentId,
      title: "Database Connection Timeout",
      description: "Primary database experiencing connection timeouts causing widespread 500 errors across user-facing services",
      severity: "high",
      status: "resolved",
      createdAt: new Date("2024-01-15T14:30:00Z"),
      resolvedAt: new Date("2024-01-15T16:45:00Z"),
      responders: [
        {
          id: "resp-1",
          name: "Alice Chen",
          role: "Senior SRE",
          actions: [
            "Investigated database connection logs",
            "Analyzed connection pool metrics", 
            "Identified pool exhaustion pattern",
            "Increased pool size configuration",
            "Verified service recovery"
          ],
          joinedAt: new Date("2024-01-15T14:35:00Z")
        },
        {
          id: "resp-2",
          name: "Bob Martinez", 
          role: "Backend Engineer",
          actions: [
            "Reviewed recent deployment changes",
            "Analyzed application performance metrics",
            "Identified inefficient query patterns", 
            "Deployed database query optimizations"
          ],
          joinedAt: new Date("2024-01-15T14:42:00Z")
        }
      ],
      timeline: [
        {
          id: "evt-1",
          timestamp: new Date("2024-01-15T14:30:00Z"),
          title: "Incident Detected",
          description: "Automated monitoring triggered high-severity alert for elevated error rates (15% 5xx errors)",
          type: "alert"
        },
        {
          id: "evt-2",
          timestamp: new Date("2024-01-15T14:35:00Z"),
          title: "Alice Chen Joined",
          description: "Senior SRE Alice Chen acknowledged incident and began investigation",
          type: "responder_joined",
          actor: "Alice Chen"
        }
      ],
      services: ["user-api", "auth-service", "database-cluster", "web-frontend", "mobile-api"],
      runbooks: [
        "Database Emergency Response Procedure",
        "Connection Pool Troubleshooting Guide"
      ],
      slackChannel: "#incident-2024-001-db-timeout",
      slackMessages: []
    };
  }
}

// Export singleton instance
export const incidentIoService = new IncidentIoMCPService();