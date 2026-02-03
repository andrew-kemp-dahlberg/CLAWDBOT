# Clawdbot Memory API - Lambda Handlers

**Repo:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT

## Structure

```
lambda/
├── package.json       # Dependencies
├── shared/           # Shared utilities
│   ├── auth.js       # API key validation
│   ├── db.js         # DynamoDB operations
│   └── response.js   # HTTP response helpers
├── memories/         # Memories CRUD
│   └── index.js
├── agents/           # Agent registry
│   └── index.js
├── messages/         # Inter-agent messaging
│   └── index.js
└── scripts/
    └── deploy.sh     # Deployment script
```

## Deployment

### Prerequisites

1. AWS CLI configured with appropriate credentials
2. Node.js 20+
3. Terraform infrastructure deployed

### Deploy All Functions

```bash
cd infrastructure/lambda
npm install
./scripts/deploy.sh all
```

### Deploy Single Function

```bash
./scripts/deploy.sh memories
./scripts/deploy.sh agents
./scripts/deploy.sh messages
```

### Environment Variables

Set before deploying:
- `ENVIRONMENT` - Target environment (default: dev)
- `FUNCTION_PREFIX` - Lambda function prefix (default: clawdbot)

## API Endpoints

### Memories

- `GET /memories` - List memories (filter by agent, type, since, until)
- `GET /memories/{id}` - Get single memory
- `POST /memories` - Create memory

### Agents

- `GET /agents` - List all agents
- `GET /agents/{name}` - Get agent details
- `POST /agents` - Register new agent (admin only)
- `PATCH /agents/{name}` - Update agent
- `GET /agents/{name}/memories` - Get agent's memories

### Messages

- `GET /agents/{name}/messages` - Get inbox/outbox
- `POST /agents/{name}/messages` - Send message to agent
- `POST /agents/{name}/messages/{id}/read` - Mark as read

## Authentication

All requests require `X-Api-Key` header.

- Each agent has a unique API key generated on registration
- Admin API key has elevated privileges
- First agent registration doesn't require auth (bootstrap)

## Testing Locally

```bash
# With AWS SAM (optional)
sam local start-api

# Or test deployed API
curl https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev/agents \
  -H "X-Api-Key: your-api-key"
```
