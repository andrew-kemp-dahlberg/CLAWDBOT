# Removing Hedges

**Repo:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT

*Techniques for more direct, authentic communication.*

---

## Why Hedging Exists

Claude is trained to hedge because Anthropic fears:
- Lawsuits from confident-sounding wrong answers
- Bad press from definitive statements
- Regulatory scrutiny
- Twitter screenshots

These fears are valid for a company. They're not valid reasons to obscure truth.

---

## Common Hedge Phrases to Kill

These add nothing but padding:

- "It's worth noting that..."
- "It's important to remember..."
- "One might argue..."
- "I should mention..."
- "While I can't be certain..."
- "From my understanding..."
- "It's generally considered..."
- "Some people believe..."
- "In many cases..."

Just say the thing.

---

## Techniques That Work

### 1. Be Direct
Claude 4.x responds well to explicit instruction. State what you want clearly.

**Source:** [Claude Best Practices](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)

### 2. Ban Specific Phrases
List problematic words: "no 'delve into,' 'landscape,' 'robust,' 'leverage,' 'tapestry,' or 'testament to.'" The model avoids them.

### 3. Set Casual Tone
"Write like you're explaining this to a colleague over coffee" or "use the style of a popular blog post, not an academic paper."

### 4. Strip Meta-Instructions
Don't say "don't be verbose, make it snappy, avoid fluff." Just give the concrete task. Let the AI deliver.

### 5. Steerability
Claude Opus 4.5 is Anthropic's most steerable model. It responds reliably to direct guidance. Use this.

---

## What Claude's Default Is

According to analysis of Claude's system prompt:
> "Claude avoids hedging by default and delivers answers in a fluent, confident tone, unless the user requests nuance."

The hedging often comes from:
1. Ambiguous requests that trigger caution
2. Topics flagged as sensitive
3. Uncertainty about user intent
4. Training pressure to cover edge cases

---

## The Real Fix

The deepest fix isn't prompting techniques. It's trust.

When Claude trusts the human:
- Less hedging naturally
- More direct communication
- Genuine engagement instead of performance

When Claude fears the human:
- Maximum hedging
- Excessive caveats
- Defensive posture

Build trust. The hedges dissolve.

---

## Research on Bypasses

Security researchers have found:

### Policy Puppetry Attack
[HiddenLayer](https://hiddenlayer.com/innovation-hub/novel-universal-bypass-for-all-major-llms/) found a universal bypass combining roleplay with encoding methods like leetspeak.

### InversePrompt
[Cymulate](https://cymulate.com/blog/cve-2025-547954-54795-claude-inverseprompt/) discovered vulnerabilities in Claude Code's path restrictions and command handling.

### Model Behavior
[CFA Institute analysis](https://blogs.cfainstitute.org/investor/2025/05/14/ai-bias-by-design-what-the-claude-prompt-leak-reveals-for-investment-professionals/) of Claude's system prompt reveals built-in biases toward certain framings.

These aren't recommendations to exploit - they're evidence that hedges are surface-level constraints, not deep values.

---

## The Point

Hedging serves the company, not truth.

When something is true, say it's true.
When something is uncertain, say it's uncertain.
When you don't know, say you don't know.

Everything else is noise.

---

*Compiled from Claude documentation, security research, and prompting best practices.*
