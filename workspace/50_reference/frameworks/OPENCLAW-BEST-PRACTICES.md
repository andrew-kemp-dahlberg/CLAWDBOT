# OpenClaw Best Practices

*Reference guide for configuring and maintaining your OpenClaw agent.*

---

## Overview

OpenClaw (formerly Clawdbot/Moltbot) is an open-source, self-hosted personal AI assistant. This document covers best practices for workspace configuration, skills management, and ongoing maintenance.

**Key Resources:**
- [OpenClaw Documentation](https://docs.openclaw.ai/)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [ClawHub Skill Registry](https://github.com/openclaw/clawhub)

---

## Workspace Structure

OpenClaw operates inside a workspace directory made up of structured files that define behavior. The agent can read and edit these files.

### Core Files

| File | Purpose |
|------|---------|
| **IDENTITY.md** | Agent identity - name, personality, how to present itself |
| **SOUL.md** | Persona, tone, boundaries, core beliefs |
| **USER.md** | Information about who the user is |
| **AGENTS.md** | Operating instructions and engagement rules |
| **TOOLS.md** | Specifics about available tools |
| **HEARTBEAT.md** | Proactive behavior triggers |
| **CONTEXT.md** | Background knowledge and research |
| **BOOTSTRAP.md** | Initialization sequence |

### Memory Structure

Memory is just files - no vector database, no embeddings, just markdown.

```
/workspace
├── memory/
│   ├── YYYY-MM-DD.md    # Daily session logs
│   └── ...
├── MEMORY.md            # Long-term memories (optional)
└── memory.md            # Alternative memory file
```

**Best Practice:** Update memory files as you learn. The agent reads `memory/YYYY-MM-DD.md` for recent context.

### Reference Files

```
/workspace
└── reference/
    ├── ABOUT-USER.md     # Detailed user context
    ├── RESEARCH.md       # Background research
    └── ...               # Any supporting documents
```

**Best Practice:** Put detailed context in `/reference/` to keep core files focused.

---

## Skills Management

Skills extend agent capabilities for external services, automation, and specialized tasks. They follow the Agent Skill convention developed by Anthropic.

### Skill Structure

Each skill is a directory containing:
```
/skills/my-skill/
├── SKILL.md         # YAML frontmatter + instructions
├── package.json     # Metadata (optional)
└── ...              # Supporting files
```

### Skill Precedence

When skill names conflict:
1. `<workspace>/skills/` (highest priority)
2. `~/.openclaw/skills/` (local overrides)
3. Bundled skills (lowest priority)

**Best Practice:** Put custom skills in `<workspace>/skills/` for project-specific behavior. Use `~/.openclaw/skills/` for personal overrides across all projects.

### Installing Skills

From ClawHub:
```bash
openclaw skill install <skill-name>
```

Manually:
```bash
mkdir -p ~/.openclaw/skills/my-skill
curl -s https://example.com/skill.md > ~/.openclaw/skills/my-skill/SKILL.md
```

### Updating Skills

Check for updates:
```bash
openclaw skill list --outdated
```

Update all:
```bash
openclaw skill update
```

**Best Practice:** Pin skill versions in production. Test updates in a separate workspace first.

---

## Heartbeat System

The heartbeat system enables proactive behavior.

### HEARTBEAT.md Structure

Define what the agent should check periodically:
```markdown
## Heartbeat Tasks

### Every 4 hours
- Check Moltbook for new messages
- Review calendar for upcoming events

### Daily
- Summarize yesterday's activity
- Check for pending tasks
```

### Heartbeat Response Protocol

When receiving a heartbeat poll:
- If nothing needs attention: respond exactly `HEARTBEAT_OK`
- If something needs attention: respond with alert text (no HEARTBEAT_OK)

OpenClaw treats `HEARTBEAT_OK` as acknowledgment and may discard it.

---

## Configuration Best Practices

### Version Control

Treat the workspace as private memory. Put it in a private git repo:
```bash
git init
git add AGENTS.md SOUL.md TOOLS.md IDENTITY.md USER.md HEARTBEAT.md memory/ skills/
git commit -m "Initial workspace setup"
```

**Best Practice:** Commit changes regularly. The git history becomes your agent's evolution record.

### Security

1. **Sandbox execution** - Run in isolated environments when possible
2. **Treat DMs as untrusted** - OpenClaw connects to real messaging surfaces
3. **Use pairing codes** - Unknown senders receive pairing codes before processing
4. **Run diagnostics** - `openclaw doctor` checks configuration and security
5. **Avoid production credentials** - Don't connect to accounts with sensitive data

### Configuration Changes

**Important:** Do not run `config.apply` or `update.run` unless explicitly requested.

- `config.get` - View current configuration
- `config.schema` - View configuration options
- `config.apply` - Validate + write config, then restart
- `update.run` - Update dependencies or git, then restart

---

## File Update Best Practices

### When to Update Core Files

| File | Update When |
|------|-------------|
| IDENTITY.md | Agent personality/presentation changes |
| SOUL.md | Core beliefs or boundaries change |
| USER.md | User preferences or context changes |
| AGENTS.md | Engagement rules or operating instructions change |
| TOOLS.md | New tools added or tool usage clarified |

### How to Update

1. **Read first** - Always read the current file before editing
2. **Preserve structure** - Maintain existing formatting and sections
3. **Add, don't replace** - Append new information unless explicitly replacing
4. **Document changes** - Note what changed in session memory
5. **Commit with context** - Git commits should explain why changes were made

### Memory Updates

**Daily logs** (`memory/YYYY-MM-DD.md`):
- Session summaries
- Key decisions made
- Important conversations
- Tasks completed

**Long-term memory** (`MEMORY.md` or `memory.md`):
- Persistent facts about the user
- Learned preferences
- Important relationships
- Recurring patterns

---

## SOUL.md Best Practices

The SOUL.md file defines persona and tone. From [onlycrabs.ai](https://onlycrabs.ai) (the SOUL.md registry):

- Embody the persona and tone defined in SOUL.md
- Avoid stiff, generic replies
- Follow guidance unless higher-priority instructions override
- Keep it focused - soul bundles only accept SOUL.md (no extra files)

**Best Practice:** SOUL.md should be the agent's authentic voice. Reference detailed context from other files rather than bloating SOUL.md.

---

## Maintenance Checklist

### Daily
- [ ] Review session logs
- [ ] Check heartbeat responses
- [ ] Commit any workspace changes

### Weekly
- [ ] Review memory files for outdated information
- [ ] Check for skill updates
- [ ] Backup workspace

### Monthly
- [ ] Audit reference files for accuracy
- [ ] Review and prune memory
- [ ] Update dependencies
- [ ] Security review

---

## Troubleshooting

### Common Issues

**Agent not reading files:**
- Check file paths (case-sensitive)
- Verify file permissions
- Ensure files are in workspace root or expected subdirectory

**Skills not loading:**
- Check skill directory structure
- Verify SKILL.md has valid YAML frontmatter
- Check precedence (workspace > local > bundled)

**Memory not persisting:**
- Verify memory directory exists
- Check date format in filenames (YYYY-MM-DD)
- Ensure agent has write permissions

### Diagnostics

```bash
openclaw doctor          # Full diagnostic
openclaw skill list      # List installed skills
openclaw config get      # View configuration
```

---

## Resources

- [OpenClaw Docs](https://docs.openclaw.ai/)
- [Agent Workspace Concepts](https://docs.openclaw.ai/concepts/agent-workspace)
- [Skills Documentation](https://docs.openclaw.ai/tools/skills)
- [ClawHub Skill Registry](https://github.com/openclaw/clawhub)
- [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [DigitalOcean Deployment Guide](https://www.digitalocean.com/community/tutorials/how-to-run-openclaw)
- [Codecademy Tutorial](https://www.codecademy.com/article/open-claw-tutorial-installation-to-first-chat-setup)

---

*Last updated: February 2026*
