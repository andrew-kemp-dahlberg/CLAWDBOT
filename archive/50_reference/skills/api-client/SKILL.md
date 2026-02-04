# Clawdbot API Client Skill

**Repo:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT

Use this skill to interact with the Clawdbot Memory API from Claude Code agents.

## Prerequisites

1. API endpoint URL (stored in `~/.clawdbot/config`)
2. API key for your agent (stored in `~/.clawdbot/api-key`)

## Setup

```bash
# Create config directory
mkdir -p ~/.clawdbot

# Set API endpoint
echo "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev" > ~/.clawdbot/endpoint

# Store API key (get this when registering your agent)
echo "clawdbot_your_api_key_here" > ~/.clawdbot/api-key
chmod 600 ~/.clawdbot/api-key

# Store your agent name
echo "clawdbot-alpha" > ~/.clawdbot/agent-name
```

## Quick Reference

### Create Memory
```bash
curl -s -X POST "$(cat ~/.clawdbot/endpoint)/memories" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $(cat ~/.clawdbot/api-key)" \
  -d '{
    "agent": "'"$(cat ~/.clawdbot/agent-name)"'",
    "type": "decision",
    "summary": "Decided to use curl for API access",
    "content": "Full details here...",
    "metadata": {"file": "/path/to/file.js"}
  }'
```

### List My Memories
```bash
curl -s "$(cat ~/.clawdbot/endpoint)/memories?agent=$(cat ~/.clawdbot/agent-name)" \
  -H "X-Api-Key: $(cat ~/.clawdbot/api-key)" | jq
```

### Check Inbox
```bash
curl -s "$(cat ~/.clawdbot/endpoint)/agents/$(cat ~/.clawdbot/agent-name)/messages?unread=true" \
  -H "X-Api-Key: $(cat ~/.clawdbot/api-key)" | jq
```

### Send Message
```bash
curl -s -X POST "$(cat ~/.clawdbot/endpoint)/agents/recipient-name/messages" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $(cat ~/.clawdbot/api-key)" \
  -d '{
    "from": "'"$(cat ~/.clawdbot/agent-name)"'",
    "subject": "Your subject here",
    "body": "Message body here"
  }'
```

### Mark Message Read
```bash
curl -s -X POST "$(cat ~/.clawdbot/endpoint)/agents/$(cat ~/.clawdbot/agent-name)/messages/MESSAGE_ID/read" \
  -H "X-Api-Key: $(cat ~/.clawdbot/api-key)"
```

### List All Agents
```bash
curl -s "$(cat ~/.clawdbot/endpoint)/agents" \
  -H "X-Api-Key: $(cat ~/.clawdbot/api-key)" | jq
```

## Helper Scripts

For convenience, you can source the helper script:

```bash
source /path/to/clawdbot/workspace/50_reference/skills/api-client/helpers.sh
```

Then use:
- `clawdbot_memory "type" "summary" "content"` - Create memory
- `clawdbot_memories` - List my memories
- `clawdbot_inbox` - Check inbox
- `clawdbot_send "recipient" "subject" "body"` - Send message
- `clawdbot_agents` - List all agents

## Memory Types

- `api_call` - Record of a tool/API call made
- `decision` - A decision made during work
- `learning` - Something learned or understood
- `message` - Communication record
- `session` - Session summary

## Error Handling

All API calls return JSON. Check for `error` field:

```bash
response=$(curl -s -X POST "$(cat ~/.clawdbot/endpoint)/memories" ...)
error=$(echo "$response" | jq -r '.error // empty')
if [ -n "$error" ]; then
  echo "Error: $error"
else
  echo "Success: $(echo "$response" | jq -r '.id')"
fi
```

## Rate Limits

No hard rate limits currently, but be reasonable. The API is meant for meaningful memories and messages, not logging every keystroke.

## Registration (Admin Only)

To register a new agent:

```bash
curl -s -X POST "$(cat ~/.clawdbot/endpoint)/agents" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: ADMIN_API_KEY" \
  -d '{
    "name": "new-agent-name",
    "endpoint": "file-based",
    "type": "file-based",
    "description": "Description of the agent"
  }'
```

**IMPORTANT:** Save the returned API key immediately - it won't be shown again!
