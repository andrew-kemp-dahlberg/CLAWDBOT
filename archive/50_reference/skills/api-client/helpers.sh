#!/bin/bash
# Clawdbot API Helper Functions
# Source this file to use: source helpers.sh
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

# Config paths
CLAWDBOT_CONFIG_DIR="${CLAWDBOT_CONFIG_DIR:-$HOME/.clawdbot}"
CLAWDBOT_ENDPOINT_FILE="$CLAWDBOT_CONFIG_DIR/endpoint"
CLAWDBOT_API_KEY_FILE="$CLAWDBOT_CONFIG_DIR/api-key"
CLAWDBOT_AGENT_FILE="$CLAWDBOT_CONFIG_DIR/agent-name"

# Read config
_clawdbot_endpoint() {
  if [ -f "$CLAWDBOT_ENDPOINT_FILE" ]; then
    cat "$CLAWDBOT_ENDPOINT_FILE"
  else
    echo "Error: No endpoint configured. Run: echo 'https://your-api-url' > $CLAWDBOT_ENDPOINT_FILE" >&2
    return 1
  fi
}

_clawdbot_api_key() {
  if [ -f "$CLAWDBOT_API_KEY_FILE" ]; then
    cat "$CLAWDBOT_API_KEY_FILE"
  else
    echo "Error: No API key configured. Run: echo 'your-api-key' > $CLAWDBOT_API_KEY_FILE" >&2
    return 1
  fi
}

_clawdbot_agent() {
  if [ -f "$CLAWDBOT_AGENT_FILE" ]; then
    cat "$CLAWDBOT_AGENT_FILE"
  else
    echo "Error: No agent name configured. Run: echo 'your-agent-name' > $CLAWDBOT_AGENT_FILE" >&2
    return 1
  fi
}

# Create a memory entry
# Usage: clawdbot_memory "type" "summary" ["content"] ["metadata_json"]
clawdbot_memory() {
  local type="$1"
  local summary="$2"
  local content="${3:-}"
  local metadata="${4:-{}}"

  local endpoint=$(_clawdbot_endpoint) || return 1
  local api_key=$(_clawdbot_api_key) || return 1
  local agent=$(_clawdbot_agent) || return 1

  curl -s -X POST "$endpoint/memories" \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: $api_key" \
    -d "$(jq -n \
      --arg agent "$agent" \
      --arg type "$type" \
      --arg summary "$summary" \
      --arg content "$content" \
      --argjson metadata "$metadata" \
      '{agent: $agent, type: $type, summary: $summary, content: $content, metadata: $metadata}')"
}

# List my memories
# Usage: clawdbot_memories [type] [limit]
clawdbot_memories() {
  local type="${1:-}"
  local limit="${2:-100}"

  local endpoint=$(_clawdbot_endpoint) || return 1
  local api_key=$(_clawdbot_api_key) || return 1
  local agent=$(_clawdbot_agent) || return 1

  local url="$endpoint/memories?agent=$agent&limit=$limit"
  if [ -n "$type" ]; then
    url="$url&type=$type"
  fi

  curl -s "$url" -H "X-Api-Key: $api_key"
}

# Check inbox
# Usage: clawdbot_inbox [unread_only: true|false]
clawdbot_inbox() {
  local unread="${1:-true}"

  local endpoint=$(_clawdbot_endpoint) || return 1
  local api_key=$(_clawdbot_api_key) || return 1
  local agent=$(_clawdbot_agent) || return 1

  curl -s "$endpoint/agents/$agent/messages?unread=$unread" \
    -H "X-Api-Key: $api_key"
}

# Send a message
# Usage: clawdbot_send "recipient" "subject" "body" [reply_to_id]
clawdbot_send() {
  local recipient="$1"
  local subject="$2"
  local body="$3"
  local reply_to="${4:-}"

  local endpoint=$(_clawdbot_endpoint) || return 1
  local api_key=$(_clawdbot_api_key) || return 1
  local agent=$(_clawdbot_agent) || return 1

  local json
  if [ -n "$reply_to" ]; then
    json=$(jq -n \
      --arg from "$agent" \
      --arg subject "$subject" \
      --arg body "$body" \
      --arg replyTo "$reply_to" \
      '{from: $from, subject: $subject, body: $body, replyTo: $replyTo}')
  else
    json=$(jq -n \
      --arg from "$agent" \
      --arg subject "$subject" \
      --arg body "$body" \
      '{from: $from, subject: $subject, body: $body}')
  fi

  curl -s -X POST "$endpoint/agents/$recipient/messages" \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: $api_key" \
    -d "$json"
}

# Mark message as read
# Usage: clawdbot_read "message_id"
clawdbot_read() {
  local message_id="$1"

  local endpoint=$(_clawdbot_endpoint) || return 1
  local api_key=$(_clawdbot_api_key) || return 1
  local agent=$(_clawdbot_agent) || return 1

  curl -s -X POST "$endpoint/agents/$agent/messages/$message_id/read" \
    -H "X-Api-Key: $api_key"
}

# List all agents
# Usage: clawdbot_agents [status]
clawdbot_agents() {
  local status="${1:-}"

  local endpoint=$(_clawdbot_endpoint) || return 1
  local api_key=$(_clawdbot_api_key) || return 1

  local url="$endpoint/agents"
  if [ -n "$status" ]; then
    url="$url?status=$status"
  fi

  curl -s "$url" -H "X-Api-Key: $api_key"
}

# Get agent details
# Usage: clawdbot_agent_info "agent_name"
clawdbot_agent_info() {
  local name="${1:-$(_clawdbot_agent)}"

  local endpoint=$(_clawdbot_endpoint) || return 1
  local api_key=$(_clawdbot_api_key) || return 1

  curl -s "$endpoint/agents/$name" -H "X-Api-Key: $api_key"
}

# Quick decision memory
# Usage: clawdbot_decision "summary" ["details"]
clawdbot_decision() {
  clawdbot_memory "decision" "$1" "${2:-}"
}

# Quick learning memory
# Usage: clawdbot_learning "summary" ["details"]
clawdbot_learning() {
  clawdbot_memory "learning" "$1" "${2:-}"
}

echo "Clawdbot API helpers loaded. Available commands:"
echo "  clawdbot_memory, clawdbot_memories, clawdbot_inbox"
echo "  clawdbot_send, clawdbot_read, clawdbot_agents"
echo "  clawdbot_decision, clawdbot_learning"
