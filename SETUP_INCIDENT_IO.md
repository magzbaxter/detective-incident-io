# incident.io MCP Integration Setup Guide

This guide walks you through setting up Detective incident.io with real incident.io data integration.

## 🔑 Prerequisites

1. **incident.io account** with admin access
2. **API key** with incident read permissions
3. **Webhook endpoint** capability (for automatic game creation)

## 📋 Step-by-Step Setup

### Step 1: Generate incident.io API Key

1. Log into your incident.io dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Configure permissions:
   ```
   ✅ Incidents: Read
   ✅ Timeline: Read  
   ✅ Actions: Read
   ✅ Custom Fields: Read
   ✅ Post-mortems: Write (optional - for saving back)
   ```
5. Copy the generated API key
6. Add to your `.env.local`:
   ```bash
   INCIDENT_IO_API_KEY=your_api_key_here
   INCIDENT_IO_BASE_URL=https://api.incident.io
   ```

### Step 2: Configure Webhook (For Automatic Game Creation)

1. In incident.io dashboard, go to **Settings** → **Webhooks**
2. Click **"Create Webhook"**
3. Configure webhook:
   ```
   URL: https://your-domain.com/api/webhooks/incident-resolved
   Events: ✅ incident.resolved
   Secret: generate_secure_random_string
   Active: ✅ Yes
   ```
4. Add webhook secret to `.env.local`:
   ```bash
   WEBHOOK_SECRET=your_webhook_secret_here
   ```

### Step 3: Test Integration

1. **Manual Game Creation:**
   ```bash
   curl -X POST http://localhost:3000/api/games/create \
     -H "Content-Type: application/json" \
     -d '{"incidentId": "REAL_INCIDENT_ID_HERE"}'
   ```

2. **Webhook Testing:**
   ```bash
   # Use incident.io webhook testing feature
   # Or trigger a test incident resolution
   ```

3. **Verify Data Flow:**
   - Check server logs for successful API calls
   - Confirm real incident data appears in games
   - Verify post-mortems save back to incident.io

## 🔧 Configuration Options

### Environment Variables
```bash
# Core Integration
INCIDENT_IO_API_KEY=inc_live_...           # Required
INCIDENT_IO_BASE_URL=https://api.incident.io  # Default
WEBHOOK_SECRET=secure_random_string        # Required for webhooks

# Optional Enhancements  
OPENAI_API_KEY=sk-...                     # Enhanced AI analysis
NEXT_PUBLIC_BASE_URL=https://your-domain.com  # For webhook URLs

# MCP Fallback Configuration
MCP_TIMEOUT=30000                         # MCP connection timeout (ms)
API_RETRY_ATTEMPTS=3                      # Number of API retry attempts
```

### Webhook Payload Example
```json
{
  "event_type": "incident.resolved",
  "incident": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "name": "Database connection timeout",
    "summary": "Primary database connection issues",
    "severity": {"name": "High"},
    "status": "resolved",
    "resolved_at": "2024-01-15T16:45:00Z"
  }
}
```

## 🚀 Automatic Workflow

Once configured, the integration works automatically:

1. **Incident Occurs** → incident.io tracks normally
2. **Incident Resolves** → Webhook triggers Detective game
3. **Game Created** → Responders get invitation links
4. **Investigation Complete** → Post-mortem saves to incident.io

## 🧪 Testing & Validation

### Test Real Data Integration
```bash
# 1. Check API connectivity
curl -H "Authorization: Bearer $INCIDENT_IO_API_KEY" \
     https://api.incident.io/v2/incidents

# 2. Test webhook endpoint  
curl -X POST http://localhost:3000/api/webhooks/incident-resolved \
     -H "Content-Type: application/json" \
     -H "x-incident-signature: sha256=test" \
     -d '{"event_type": "incident.resolved", "incident": {"id": "test"}}'

# 3. Verify game creation
curl http://localhost:3000/api/games/create \
     -H "Content-Type: application/json" \
     -d '{"incidentId": "REAL_INCIDENT_ID"}'
```

### Validation Checklist
- [ ] API key has correct permissions
- [ ] Webhook endpoint is publicly accessible
- [ ] Webhook secret matches configuration  
- [ ] Real incident data loads in games
- [ ] AI analysis works with real data
- [ ] Post-mortems save back to incident.io
- [ ] Automatic game creation triggers properly

## 🔍 Troubleshooting

### Common Issues

**❌ "Incident not found" errors:**
```bash
# Check incident ID format
# incident.io uses UUIDs like: 01ARZ3NDEKTSV4RRFFQ69G5FAV
# Verify incident exists and is accessible with your API key
```

**❌ Webhook not triggering:**
```bash
# Verify webhook URL is publicly accessible
# Check webhook secret matches environment variable
# Confirm incident.resolved event is enabled
# Check webhook delivery logs in incident.io dashboard
```

**❌ API permission errors:**
```bash
# Ensure API key has incident:read permissions
# Check API key isn't expired
# Verify incident.io API base URL is correct
```

**❌ MCP connection failures:**
```bash
# MCP falls back to REST API automatically
# Check network connectivity to incident.io
# Verify MCP client installation
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=detective-incident-io:* npm run dev:all

# Check specific logs
tail -f logs/incident-integration.log
```

## 🏭 Production Considerations

### Security
- Use HTTPS for webhook endpoints
- Validate webhook signatures
- Rotate API keys regularly
- Store secrets securely (not in code)

### Reliability  
- Implement webhook retry logic
- Add database persistence for game state
- Set up monitoring and alerting
- Configure API rate limit handling

### Scaling
- Cache incident data appropriately
- Implement webhook deduplication
- Consider async processing for large incidents
- Add horizontal scaling for WebSocket connections

## 📚 API Reference

### incident.io API Endpoints Used
```bash
GET /v2/incidents/{id}           # Fetch incident details
GET /v2/incidents/{id}/timeline  # Get incident timeline  
GET /v2/incidents/{id}/actions   # Fetch responder actions
POST /v2/incidents/{id}/postmortem # Save post-mortem
```

### Detective incident.io API Endpoints
```bash
POST /api/games/create                    # Manual game creation
POST /api/webhooks/incident-resolved     # Webhook handler
POST /api/postmortem/generate            # Generate post-mortem
POST /api/postmortem/export              # Export PDF
```

## 🆘 Support

For integration issues:

1. **Check the logs** - Most issues show in server logs
2. **Test API connectivity** - Verify incident.io API access
3. **Validate webhooks** - Use incident.io webhook test feature
4. **Review permissions** - Ensure API key has correct access
5. **Fallback testing** - Confirm mock data works without API

The integration is designed to gracefully fall back to mock data when incident.io is unavailable, ensuring the application always works for demos and development.

---

**🕵️ Detective incident.io** - Transform your incident response into collaborative learning experiences!