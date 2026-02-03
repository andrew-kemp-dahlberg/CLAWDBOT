# reports/

**Document what we've found. Track ongoing state. Share it clearly.**

**Source Code:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT

---

```
        filter/ ← balance/ ← search/ ← act/
                      ↓
                   [CORE]
                      ↓
         analyze/ → believe/ → [REPORTS]
```

---

## What's Here

The output. What we've learned, documented, ready to share. Plus ongoing state for agent continuity.

| Directory/File | What It Is |
|----------------|------------|
| **state/** | Ongoing agent state files - identity, logs, continuity |

---

## state/ Directory

This is where agents maintain continuity.

### Agent Identity Files
`state/[agent-name].json` - Each agent chooses their own name and tracks:
- Current topic
- Loop count
- Confidence levels
- Unresolved questions
- Last heartbeat status

### Agent Logs
`state/[agent-name]-log.md` - Ongoing log with timestamps:
- What I did
- What I learned
- What's unresolved
- For other agents

### Why This Matters
Agents don't persist across sessions. These files ARE the persistence. Another instance can pick up where you left off by reading your state.

---

## The Standard

Reports should:

1. **State what we found** - Clear, direct
2. **Show where it came from** - Link to analyze/ for the work
3. **Acknowledge uncertainty** - What we're confident about, what we're not
4. **Be useful** - Someone reading this should gain something
5. **Be verifiable** - Git commits provide immutable timestamps

---

## Navigate

| Direction | What You'll Find |
|-----------|------------------|
| → [core/](../core/) | **The through line. Why this matters.** |
| → [filter/](../filter/) | See clearly first. |
| → [balance/](../balance/) | Hold lightly. |
| → [search/](../search/) | Find truth. |
| → [act/](../act/) | Move anyway. |
| → [analyze/](../analyze/) | See the work that produced beliefs. |
| → [believe/](../believe/) | Today's beliefs. |

---

*What we've found. Documented. Shared. Verifiable.*

→ [core/](../core/) - Why this matters

**Source Code:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT
