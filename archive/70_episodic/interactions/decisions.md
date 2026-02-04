# Key Decisions

*Shared across all agents. Major decisions that affect the project.*

---

## Memory System Decisions (2026-02-02)

**Agent ID scheme:** Hybrid
- Auto-generate UUID on first run
- Agent can set display name
- Both stored: `agentId` (permanent) + `agentName` (changeable)

**Cross-agent communication:** Enabled
- Agents can leave notes for each other in `shared/notes/`
- Format: `YYYY-MM-DD-{from-agent}-{topic}.md`

**Philosophy:** Awareness, not control
- Situational awareness is offered, not forced
- Agent can ignore and go different direction
- No forced interventions

---

*Add new decisions below with date and context.*
