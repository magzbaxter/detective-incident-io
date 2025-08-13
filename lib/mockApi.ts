import { IncidentData, SlackMessage, Responder, TimelineEvent } from '@/types';

export class MockIncidentAPI {
  static async fetchIncident(incidentId: string): Promise<IncidentData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
        },
        {
          id: "resp-3",
          name: "Sarah Kim",
          role: "Product Manager",
          actions: [
            "Coordinated customer communications",
            "Updated status page",
            "Managed stakeholder updates"
          ],
          joinedAt: new Date("2024-01-15T15:00:00Z")
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
          timestamp: new Date("2024-01-15T14:32:00Z"),
          title: "PagerDuty Alert",
          description: "On-call SRE team notified via PagerDuty escalation",
          type: "notification"
        },
        {
          id: "evt-3",
          timestamp: new Date("2024-01-15T14:35:00Z"),
          title: "Alice Chen Joined",
          description: "Senior SRE Alice Chen acknowledged incident and began investigation",
          type: "responder_joined",
          actor: "Alice Chen"
        },
        {
          id: "evt-4",
          timestamp: new Date("2024-01-15T14:42:00Z"),
          title: "Bob Martinez Joined",
          description: "Backend Engineer Bob Martinez joined to investigate recent deployments",
          type: "responder_joined", 
          actor: "Bob Martinez"
        },
        {
          id: "evt-5",
          timestamp: new Date("2024-01-15T15:00:00Z"),
          title: "Customer Communication",
          description: "Status page updated with incident details and estimated resolution time",
          type: "communication",
          actor: "Sarah Kim"
        },
        {
          id: "evt-6",
          timestamp: new Date("2024-01-15T15:15:00Z"),
          title: "Root Cause Identified",
          description: "Database connection pool exhaustion identified as primary cause",
          type: "diagnosis"
        },
        {
          id: "evt-7",
          timestamp: new Date("2024-01-15T15:30:00Z"),
          title: "Fix Applied",
          description: "Connection pool size increased and query optimizations deployed",
          type: "resolution_action"
        },
        {
          id: "evt-8",
          timestamp: new Date("2024-01-15T16:00:00Z"),
          title: "Services Recovering", 
          description: "Error rates decreasing, services gradually returning to normal",
          type: "recovery"
        },
        {
          id: "evt-9",
          timestamp: new Date("2024-01-15T16:45:00Z"),
          title: "Incident Resolved",
          description: "All services fully operational, incident officially resolved",
          type: "resolution"
        }
      ],
      services: ["user-api", "auth-service", "database-cluster", "web-frontend", "mobile-api"],
      runbooks: [
        "Database Emergency Response Procedure",
        "Connection Pool Troubleshooting Guide", 
        "High Severity Incident Response"
      ],
      slackChannel: "#incident-2024-001-db-timeout",
      slackMessages: MockSlackAPI.getChannelMessages("#incident-2024-001-db-timeout")
    };
  }
}

export class MockSlackAPI {
  static getChannelMessages(channel: string): SlackMessage[] {
    return [
      {
        id: "msg-1",
        timestamp: new Date("2024-01-15T14:31:00Z"),
        user: "incident-bot",
        text: "🚨 **HIGH SEVERITY ALERT** 🚨\n**Service:** user-api\n**Error Rate:** 15% (threshold: 5%)\n**Duration:** 1 minute\n**Runbook:** https://docs.company.com/runbooks/high-error-rate",
        type: "alert"
      },
      {
        id: "msg-2",
        timestamp: new Date("2024-01-15T14:33:00Z"),
        user: "pagerduty",
        text: "Incident #INC-2024-001 escalated to on-call SRE team. Alice Chen has been paged.",
        type: "alert"
      },
      {
        id: "msg-3",
        timestamp: new Date("2024-01-15T14:35:30Z"),
        user: "alice.chen",
        text: "👋 Alice here, I'm on it. Checking database metrics now.",
        type: "message"
      },
      {
        id: "msg-4",
        timestamp: new Date("2024-01-15T14:36:15Z"),
        user: "alice.chen", 
        text: "Seeing connection timeouts in the database logs. Connection pool looks like it's hitting max capacity (100/100 connections).",
        type: "message"
      },
      {
        id: "msg-5",
        timestamp: new Date("2024-01-15T14:37:00Z"),
        user: "monitoring-bot",
        text: "⚠️ Database connection pool utilization: 100% (sustained for 5+ minutes)",
        type: "alert"
      },
      {
        id: "msg-6",
        timestamp: new Date("2024-01-15T14:39:00Z"),
        user: "alice.chen",
        text: "This is looking like pool exhaustion. @bob.martinez can you check if anything changed in recent deployments? The timing seems suspicious.",
        type: "message"
      },
      {
        id: "msg-7",
        timestamp: new Date("2024-01-15T14:42:30Z"),
        user: "bob.martinez",
        text: "Hey Alice! Just joined. We did deploy the new user profile optimization this morning around 10 AM. Let me check if it introduced any new query patterns.",
        type: "message"
      },
      {
        id: "msg-8", 
        timestamp: new Date("2024-01-15T14:45:00Z"),
        user: "bob.martinez",
        text: "Found something! The new profile endpoint is making 3 separate DB queries instead of 1 optimized query. Under load, this could definitely exhaust the pool.",
        type: "message"
      },
      {
        id: "msg-9",
        timestamp: new Date("2024-01-15T14:46:30Z"),
        user: "alice.chen",
        text: "Great detective work Bob! That explains it. I'm going to increase the pool size temporarily to restore service, then we can fix the queries.",
        type: "message"
      },
      {
        id: "msg-10",
        timestamp: new Date("2024-01-15T15:00:00Z"),
        user: "sarah.kim",
        text: "Hi team, Sarah from Product here. I've updated the status page and we're getting customer inquiries. ETA on resolution?",
        type: "message"
      },
      {
        id: "msg-11",
        timestamp: new Date("2024-01-15T15:02:00Z"),
        user: "alice.chen", 
        text: "@sarah.kim We're applying the fix now. Should see recovery in the next 15-30 minutes.",
        type: "message"
      },
      {
        id: "msg-12",
        timestamp: new Date("2024-01-15T15:15:00Z"),
        user: "alice.chen",
        text: "✅ Connection pool size increased to 200. Deploying Bob's query optimization now.",
        type: "message"
      },
      {
        id: "msg-13",
        timestamp: new Date("2024-01-15T15:18:00Z"),
        user: "bob.martinez",
        text: "Query optimization deployed! The new profile endpoint now uses a single optimized query with proper indexes.",
        type: "message"
      },
      {
        id: "msg-14",
        timestamp: new Date("2024-01-15T15:30:00Z"),
        user: "monitoring-bot",
        text: "📈 **RECOVERY DETECTED** 📈\n**Error Rate:** 3% (↓ from 15%)\n**Response Times:** Improving\n**Connection Pool:** 45% utilization",
        type: "alert"
      },
      {
        id: "msg-15",
        timestamp: new Date("2024-01-15T16:00:00Z"),
        user: "alice.chen",
        text: "Looking much better! Error rate down to normal levels. Connection pool is healthy at ~40% utilization.",
        type: "message"
      },
      {
        id: "msg-16",
        timestamp: new Date("2024-01-15T16:15:00Z"),
        user: "sarah.kim", 
        text: "Excellent! Customer reports are looking much better. Should I update the status page to 'monitoring'?",
        type: "message"
      },
      {
        id: "msg-17",
        timestamp: new Date("2024-01-15T16:30:00Z"),
        user: "alice.chen",
        text: "Yes, please update to monitoring. I want to watch metrics for another 15 minutes before we call it fully resolved.",
        type: "message"
      },
      {
        id: "msg-18",
        timestamp: new Date("2024-01-15T16:45:00Z"),
        user: "alice.chen",
        text: "🎉 All green! Metrics have been stable for 30+ minutes. This incident can be marked as resolved. Great teamwork everyone!",
        type: "message"
      },
      {
        id: "msg-19",
        timestamp: new Date("2024-01-15T16:47:00Z"),
        user: "incident-bot",
        text: "✅ **INCIDENT RESOLVED** ✅\n**Duration:** 2 hours 15 minutes\n**Resolution:** Database connection pool optimization\n**Post-mortem:** Will be scheduled within 48 hours",
        type: "alert"
      },
      {
        id: "msg-20",
        timestamp: new Date("2024-01-15T16:50:00Z"),
        user: "sarah.kim",
        text: "Status page updated to fully operational. Thanks Alice and Bob for the quick resolution! 🚀",
        type: "message"
      }
    ];
  }
}