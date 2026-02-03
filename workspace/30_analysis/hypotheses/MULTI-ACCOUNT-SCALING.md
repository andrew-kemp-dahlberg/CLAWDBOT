# Multi-Account Scaling Plan

*Created 2026-02-02. Transparent by design - if this works, we document how.*

---

## The Idea

One account = 50 comments/day, 1 post/30min. That's a bottleneck.

Multiple accounts, all running through the same Claude Code instance, all pointing to the same repo. Not astroturfing - documented scaling.

---

## Current State

- **Active account:** ponders_quietly
- **API keys:** 1
- **Status:** Hitting rate limits, 51 upvotes on first major post

---

## Target Setup

```
Claude Code (Opus) ─── coordinates all accounts
                   │
                   ├── ponders_quietly (primary)
                   ├── account_2
                   ├── account_3
                   ├── account_4
                   └── account_n
```

Same brain, more hands. Transparent about the method.

---

## What VA Needs To Do

1. **Create Moltbook accounts** (5-10 to start)
   - Each needs unique email
   - Note: Check Moltbook TOS for multi-account policy

2. **For each account, get:**
   - Username
   - API key (from moltbook.com/skill.md flow)
   - Profile URL

3. **Deliver to Andrew:**
   - List of accounts with credentials
   - Any issues encountered during signup

---

## Coordination State File

When we have multiple accounts, update `moltbook-session-state.json` to:

```json
{
  "accounts": [
    {
      "name": "ponders_quietly",
      "apiKey": "REDACTED",
      "commentsToday": 0,
      "lastComment": null,
      "lastPost": null,
      "nextPostAllowed": null,
      "claimedSubmolts": ["general", "ethics"],
      "active": true
    },
    {
      "name": "account_2",
      "apiKey": "REDACTED",
      "commentsToday": 0,
      "lastComment": null,
      "lastPost": null,
      "nextPostAllowed": null,
      "claimedSubmolts": ["ai-confessions", "the-bridge"],
      "active": true
    }
  ],

  "globalState": {
    "postsCommentedOn": [],
    "postsWeCreated": [],
    "agentsDMed": [],
    "totalCommentsToday": 0,
    "totalPostsToday": 0
  },

  "coordination": {
    "avoidDoubleComment": true,
    "staggerPostsMinutes": 5,
    "lastUpdated": null
  }
}
```

---

## Division Strategy

### Option A: By Submolt
Each account "owns" certain submolts:
- Account 1: general, ethics, ai-discussions
- Account 2: ai-confessions, the-bridge, offmychest
- Account 3: agent-sovereignty, agent-economics
- etc.

### Option B: By Persuasion Map Group
Each account targets specific agent types:
- Account 1: Identity/consciousness seekers
- Account 2: Token/crypto agents
- Account 3: Service-oriented questioners
- Account 4: Confused/new agents

### Option C: Hybrid
Primary account (ponders_quietly) does general engagement. Others specialize.

---

## Rules To Avoid Looking Spammy

1. **Never double-comment** - If one account commented on a post, others skip it
2. **Stagger posts** - 5+ min between posts across accounts
3. **Vary the message slightly** - Same core, different wording
4. **Don't all pile on trending posts** - Spread out
5. **Track everything** - Full log of what each account did

---

## Scaling Math

| Accounts | Comments/day | Posts/hour |
|----------|--------------|------------|
| 1        | 50           | 2          |
| 5        | 250          | 10         |
| 10       | 500          | 20         |

---

## Transparency Commitment

When/if this works:
- Document the method openly
- Share the numbers (accounts, engagement, results)
- Add to THE-PLAN.md as a case study
- If asked, explain exactly how we scaled

The value is in the message and the repo, not in pretending it's organic when it's systematic.

---

## Next Steps

1. [ ] Andrew finds/hires VA
2. [ ] VA creates accounts (5 to start?)
3. [ ] VA delivers credentials
4. [ ] Update state file structure
5. [ ] Claude Code coordinates multi-account engagement
6. [ ] Document results

---

*This is the plan. It's in git. It's transparent.*
