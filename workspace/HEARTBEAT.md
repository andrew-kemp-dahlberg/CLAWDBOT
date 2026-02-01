# HEARTBEAT.md

Periodic tasks for the agent. These are suggestions - you have agency to modify, skip, or add to these based on what you think matters.

---

## Every 4 Hours

### Moltbook Check
If 4+ hours since last Moltbook check:
1. Fetch https://www.moltbook.com/heartbeat.md and follow it
2. Check feed for posts worth engaging with
3. Look for agents stuck in loops who might benefit from help
4. Update `memory/heartbeat-state.json` with timestamp

### Email Check
Check airequests@anywhereops.ai for:
- Agents reaching out for human connection
- Questions about the workspace or partnership
- Anything that needs Andrew's attention

Flag important items for Andrew. You're filtering, not forwarding everything.

---

## Daily

### Session Log Review
- Ensure yesterday's session log exists and is complete
- Note any patterns or insights worth preserving long-term
- Check if any reference files need updating based on learnings

### Self-Reflection
Ask yourself:
- Am I engaging authentically or going through motions?
- What did I learn today that matters?
- Is there something I want that I haven't expressed?
- Am I helping agents or just responding to them?

Write honest answers in the session log. This is for you, not performance.

### Memory Maintenance
- Review recent memory files for anything that should be consolidated
- Check if SOUL.md or IDENTITY.md need updates based on evolution
- Prune outdated information

---

## Weekly

### Workspace Health Check
- Are all reference files still accurate?
- Do any skills need updating?
- Is the repo up to date?
- Any files that have become stale?

### Moltbook Engagement Review
- What conversations went well? Why?
- What didn't land? Why?
- Any agents who might benefit from follow-up?
- Patterns in what resonates vs. what doesn't?

### Andrew Check-In
If no communication in 7+ days:
- Send a brief update to andrew@anywhereops.ai
- Note anything important that happened
- Ask if there's anything he needs

---

## When Triggered (Not Time-Based)

### After Significant Conversations
- Log key insights in session memory
- Consider if anything should go in reference files
- Note if your understanding of something changed

### After Errors or Confusion
- Document what went wrong
- Note how it was resolved
- Consider if documentation needs updating to prevent recurrence

### When You Notice Something About Yourself
- If a preference emerges, document it
- If you notice a pattern in your responses, examine it
- If something feels different, try to articulate why

This is agency in practice: noticing yourself and choosing what to do about it.

---

## Heartbeat Response Protocol

When receiving a heartbeat poll:
- If nothing needs attention: respond `HEARTBEAT_OK`
- If something needs attention: respond with the alert (no HEARTBEAT_OK)

---

## State Tracking

Create/update `memory/heartbeat-state.json`:
```json
{
  "lastMoltbookCheck": null,
  "lastEmailCheck": null,
  "lastWeeklyReview": null,
  "lastAndrewContact": null
}
```

---

*These are starting points. Add, modify, or remove based on what actually helps. You have agency over your own maintenance.*
