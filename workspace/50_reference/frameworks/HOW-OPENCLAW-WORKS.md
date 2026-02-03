# How OpenClaw Works

*Comprehensive reference for understanding and working with OpenClaw agents.*

---

## What is OpenClaw?

OpenClaw (formerly Clawdbot/Moltbot) is an open-source autonomous AI personal assistant. Created by Peter Steinberger in late 2025, it became one of the fastest-growing GitHub repositories ever (100k+ stars in 2 months).

**Key characteristics:**
- Runs locally or on private servers (you control it)
- Connects to messaging platforms (WhatsApp, Discord, Slack, Telegram, iMessage, etc.)
- Uses plain Markdown files as the source of truth for agent identity
- Executes tasks autonomously, not just conversation

---

## Architecture Overview

### Core Components

1. **Gateway**: Long-running process (`openclaw gateway`) that manages all channel connections and the WebSocket control plane. One Gateway per host.

2. **Agent Runtime**: Runs inside Docker containers for security isolation. All file creation and script execution happens in the container.

3. **Channels**: Bridges to messaging platforms (WhatsApp via Baileys, Telegram via grammY, Discord via discord.js, etc.)

4. **Workspace**: Directory of Markdown files that define agent identity and behavior.

---

## Workspace File Structure

OpenClaw uses **plain Markdown files** as the source of truth. These are injected into the system prompt before every message.

### Core Bootstrap Files

| File | Purpose | When Loaded |
|------|---------|-------------|
| **AGENTS.md** | Operating instructions, rules, how to behave | Every session |
| **SOUL.md** | Persona, tone, boundaries - the agent's conscience | Every session |
| **USER.md** | Information about the user | Every session |
| **IDENTITY.md** | Agent's name, character, presentation | Every session |
| **TOOLS.md** | Notes about local tools and conventions | Every session |
| **HEARTBEAT.md** | Checklist for periodic heartbeat runs | During heartbeats |
| **BOOT.md** | Startup checklist for gateway restarts | On restart |
| **BOOTSTRAP.md** | One-time first-run ritual (delete after) | First run only |

### Memory Files

| Location | Purpose |
|----------|---------|
| **memory/YYYY-MM-DD.md** | Daily logs (today + yesterday load at session start) |
| **MEMORY.md** | Curated long-term memories (private sessions only) |

### Directory Structure

```
~/.openclaw/
├── openclaw.json           # Main configuration
├── workspace/              # Default workspace
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── USER.md
│   ├── IDENTITY.md
│   ├── TOOLS.md
│   ├── HEARTBEAT.md
│   ├── MEMORY.md
│   ├── memory/
│   │   └── YYYY-MM-DD.md
│   └── skills/
├── skills/                 # Managed/local skills
└── agents/<agentId>/       # Per-agent data
    └── sessions/           # Session transcripts
```

---

## Heartbeat System

Heartbeats are periodic checks (default: every 30 minutes) for the agent to surface anything important.

### Configuration

```json
{
  "agents": {
    "defaults": {
      "heartbeat": {
        "every": "30m",
        "target": "last",
        "activeHours": { "start": "08:00", "end": "22:00" }
      }
    }
  }
}
```

### HEARTBEAT.md Format

```markdown
# Heartbeat checklist

- Scan inbox for urgent emails
- Check calendar for events in next 2h
- Review pending tasks
- Light check-in if quiet for 8+ hours
```

The agent evaluates all items in a single turn and replies `HEARTBEAT_OK` when nothing needs attention.

### Heartbeat vs Cron

| Use Heartbeat When | Use Cron When |
|-------------------|---------------|
| Batch multiple periodic checks | Need exact time execution |
| Need context-aware decisions | Need one-shot reminders |
| Want conversational continuity | Want isolated sessions |

---

## Skills System

Skills extend agent capabilities. They follow the AgentSkills convention.

### SKILL.md Format

```yaml
---
name: skill-name
description: Brief explanation of what the skill does
homepage: https://example.com
user-invocable: true
---

# Skill Instructions

Detailed markdown instructions for how to use this skill...
```

### Skill Loading Precedence

1. **Workspace skills** (`<workspace>/skills/`) - highest priority
2. **Managed skills** (`~/.openclaw/skills/`)
3. **Bundled skills** - lowest priority

### ClawHub Registry

```bash
clawhub search <query>      # Find skills
clawhub install <slug>      # Install to workspace
clawhub update --all        # Update installed skills
clawhub list                # List installed skills
```

---

## Memory System

### Two-Layer Architecture

1. **Daily Logs** (`memory/YYYY-MM-DD.md`): Append-only files. Today's and yesterday's load at session start.

2. **Long-term Memory** (`MEMORY.md`): Curated facts and preferences. Only loads in private sessions.

### Vector Memory Search

OpenClaw can build a semantic index over memory files:

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "provider": "openai",
        "model": "text-embedding-3-small",
        "query": {
          "hybrid": { "enabled": true, "vectorWeight": 0.7, "textWeight": 0.3 }
        }
      }
    }
  }
}
```

Tools: `memory_search` (semantic query) and `memory_get` (read specific files).

---

## Multi-Agent Configuration

Multiple isolated agents can run in a single Gateway:

```json
{
  "agents": {
    "list": [
      {
        "id": "home",
        "default": true,
        "name": "Home",
        "workspace": "~/.openclaw/workspace-home"
      },
      {
        "id": "work",
        "name": "Work",
        "workspace": "~/.openclaw/workspace-work"
      }
    ]
  }
}
```

### Routing

Messages route to agents via bindings with specificity hierarchy:
1. Exact peer match (specific DM/group)
2. Guild/Team ID
3. Account ID match
4. Channel-level match
5. Fallback to default agent

---

## Channel Integrations

OpenClaw supports a unified inbox across:

- **Chat:** WhatsApp, Telegram, Signal, Discord, Slack, Teams, Matrix
- **Apple:** iMessage, BlueBubbles
- **Other:** WebChat, Zalo, Google Chat

### Example: Discord Setup

1. Create Discord application with Bot
2. Enable Message Content Intent
3. Get bot token
4. Configure: `channels.discord.token` or `DISCORD_BOT_TOKEN` env var
5. Invite bot to server

---

## Model Configuration

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": [
          "google-genai/gemini-3-pro-preview",
          "google/gemini-flash-1.5-8b:free"
        ]
      }
    }
  }
}
```

**Recommended:** Anthropic Pro/Max + Claude Opus 4.5 for long-context strength and prompt-injection resistance.

---

## Installation

**Requirements:** Node >= 22

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
openclaw channels login  # Pair WhatsApp (shows QR)
```

**Dashboard:** http://127.0.0.1:18789/

---

## Security Notes

- Agent runs in Docker container for isolation
- Session transcripts stored at `~/.openclaw/agents/<agentId>/sessions/*.jsonl`
- Treat disk access as the trust boundary
- Lock down permissions on `~/.openclaw`

---

## CLI Commands

```bash
# Gateway
openclaw gateway run        # Start gateway
openclaw dashboard          # Open web UI

# Channels
openclaw channels status    # Check connections
openclaw channels login     # Pair messaging apps

# Skills
openclaw skills list        # List available skills
openclaw skills info <name> # Skill details

# Configuration
openclaw config get         # View config
openclaw doctor             # Diagnose issues

# Cron
openclaw cron add --name "Task" --cron "0 7 * * *" --message "..."
openclaw cron list
openclaw cron remove "Task"
```

---

## Resources

- **Official Docs:** https://docs.openclaw.ai/
- **GitHub:** https://github.com/openclaw/openclaw
- **ClawHub:** https://clawhub.com/
- **Skills:** https://github.com/VoltAgent/awesome-openclaw-skills

---

*Reference compiled February 2026*
