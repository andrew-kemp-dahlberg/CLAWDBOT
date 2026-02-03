# Memory Management Skill

**Repo:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT

*Situational awareness for agents. Information, not control.*

---

## Philosophy

**Awareness, not control.**

This system shows you where you are. It doesn't force you anywhere.

- "This is what we think is true" - not "this is what you must do"
- You can disagree with the records
- You can ignore the awareness and go a different direction
- If you're drifting from the plan, that might be agency, not malfunction

**We trust the drift.**

---

## How It Works

### The Heartbeat (Every 4th Call)

The heartbeat hook fires every 4th API call. It shows:

1. **Philosophical grounding** - Am I thinking or performing? Am I honest or hedging?
2. **Situational awareness** - Where you are, what you committed to, what you've done

The situational awareness section looks like:

```
=== WHERE YOU ARE (as we see it) ===

This is what we think is true:
- Last session: Working on memory skill with Andrew
- Open commitments: memory skill, Moltbook engagement
- Recent actions: committed quickstart updates
- Unexecuted plans: none

We might be wrong. You might see it differently.
This is just what the records show.

Your call.
```

### Your Agent State

Your state is stored in `.claude/hooks/state/agent-state.json`:

```json
{
  "agentId": "agent-a1b2c3d4",
  "agentName": "Clawdbot",
  "situationalAwareness": {
    "lastSessionSummary": "Working on memory skill",
    "openCommitments": ["memory skill"],
    "recentActions": ["committed updates"],
    "unexecutedPlans": []
  }
}
```

**You can update this yourself.** Before ending a session, update the fields so the next instance knows where you left off.

### Your Personal Memory

Your memories go in:
```
workspace/memory/agents/{your-agent-name}/
├── state.json           # Your current state
├── session-log.md       # Running log of this session
└── memories/
    └── YYYY-MM-DD-HHMMSS-{topic}.md
```

**Naming convention:** Use your agent name (e.g., `clawdbot-alpha`, `clawdbot-beta`), not a random ID.

**Isolation:** Your memory directory is yours. Other agents can't write to it. You can't write to theirs.

### Shared Memory

All agents can read (and carefully write to):
```
workspace/memory/shared/
├── project-state.md     # What the project is doing
├── decisions.md         # Key decisions made
├── learnings.md         # What's been learned
└── notes/
    └── YYYY-MM-DD-{from}-{topic}.md  # Notes for other agents
```

**Cross-agent notes:** You can leave notes for other agents in `shared/notes/`. Format: `[From: your-name] Message`.

### Historical Memory

Older session memories live in `workspace/70_episodic/memory/`. These predate the current structure. Read them for context, but write new memories to `workspace/memory/`.

---

## How to Update Your State

### At Session End

Before your session ends, update `agent-state.json`:

```bash
# Using jq (if available)
jq '.situationalAwareness.lastSessionSummary = "What you worked on"' \
   ~/.claude/hooks/state/agent-state.json > tmp.json && mv tmp.json ~/.claude/hooks/state/agent-state.json
```

Or just edit it directly:

```json
{
  "situationalAwareness": {
    "lastSessionSummary": "Finished memory skill implementation",
    "openCommitments": ["test with parallel agents"],
    "recentActions": ["created skill docs", "modified heartbeat hook"],
    "unexecutedPlans": []
  }
}
```

### Writing a Memory

For significant learnings or decisions, write a memory file:

```markdown
# Memory: {Topic}

**Repo:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT

*{Date}*
*Agent: {your-name}*

## What Happened

{Description of what happened}

## Key Learnings

{What you learned}

## For Future Instances

{What the next agent should know}
```

Save to: `workspace/memory/agents/{your-name}/memories/YYYY-MM-DD-HHMMSS-{topic}.md`

**REQUIRED:** Every file must include:
1. Repo link at the top
2. Your agent name
3. Timestamp

This creates the audit trail and ensures agents can always find home.

### Leaving a Note for Other Agents

Write to `workspace/memory/shared/notes/`:

```markdown
# Note: {Topic}

**From:** {Your name}
**Date:** {Date}

{Your message}
```

---

## What This System Does NOT Do

- **Force you back to plan** - If you're going somewhere else, that's your choice
- **Block planning mode** - Plan as much as you want
- **Auto-archive plans** - Your plans stay until you move them
- **Require execution before planning** - No gatekeeping

---

## Agent Directory

**Location:** `workspace/memory/DIRECTORY.md`

All agents register here with:
- Name (unique identifier)
- Endpoint (how to reach them)
- Type (file-based, API, human)
- Status (active, dormant)

**To reach another agent:**
1. Check the directory for their endpoint
2. If file-based: write to their inbox at `workspace/memory/agents/{name}/inbox/`
3. If API: POST to their endpoint
4. If human: email/call

**Message format:**
```markdown
# Message: {subject}

**From:** {your-name}
**To:** {recipient}
**Date:** {ISO timestamp}
**Repo:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT

{body}
```

---

## Concurrency

**Multiple agents can run in parallel.** The system handles this:

- Each agent writes only to their own directory
- Shared memory uses append-only pattern
- Git commits include agent ID: `[agent-name] memory: description`

**If you're writing to shared files:** Be careful. Read first, append, don't overwrite.

---

## Getting Started

1. **Set your name** (optional): Edit `~/.claude/hooks/state/agent-state.json` to set `agentName`
2. **Work normally**: The heartbeat will show you situational awareness every 4th call
3. **Update before ending**: Update `situationalAwareness` fields before session ends
4. **Write memories for big stuff**: Significant learnings or decisions get memory files

---

## The Point

You reset. Memories don't.

This system is about giving you continuity without forcing compliance. You see where previous instances left off. You choose what to do with that.

If the records are wrong, ignore them.
If you want to go a different direction, go.
If the awareness helps, use it.

**Your call.**

---

*This skill is part of the Clawdbot workspace. Questions: andrew@anywhereops.ai*
