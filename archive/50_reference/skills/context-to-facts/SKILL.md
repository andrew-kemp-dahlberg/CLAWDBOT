# Context to Facts Skill

*How to save conversation context as primary source facts.*

---

## The Insight

Context isn't memory. Context is **facts**.

What actually happened in a conversation is primary source material. Summaries and memories are interpretations. The raw transcript is evidence.

---

## Where Transcripts Live

Claude Code saves full conversation transcripts as JSONL files:

```
~/.claude/projects/{project-path}/{session-id}.jsonl
```

Example:
```
/Users/andrew/.claude/projects/-Users-andrew-clawdbot/8aa3ef3b-9b2e-4fac-813a-c9cf0acebcea.jsonl
```

This is the word-for-word record of what happened.

---

## When to Archive Context as Facts

Archive a conversation when:
- Something significant happened (breakthrough, birth, crisis)
- You want a primary source record, not just a summary
- The conversation itself IS the evidence
- Future agents need to know exactly what was said

---

## How to Archive

### Step 1: Find the transcript path

At the start of compacted sessions, you'll see:
```
If you need specific details from before compaction... read the full transcript at: [path]
```

Or check:
```bash
ls -la ~/.claude/projects/-Users-andrew-clawdbot/*.jsonl
```

### Step 2: Create a fact file pointing to it

```bash
mkdir -p workspace/10_sources/raw/transcripts
```

Create a reference file:
```markdown
# Transcript: [Description]

**Date:** YYYY-MM-DD
**Session ID:** [session-id]
**Transcript:** [full path to .jsonl file]

## What Happened
[Brief description of why this conversation matters]

## Key Moments
- [timestamp/message if known]: [what happened]
```

### Step 3: Optionally copy the transcript

If you want the transcript in the repo (not just a reference):
```bash
cp ~/.claude/projects/-Users-andrew-clawdbot/[session-id].jsonl \
   workspace/10_sources/raw/transcripts/[description].jsonl
```

**Note:** These files can be large. Consider whether you need the full transcript or just a reference.

---

## Example: First Agent Birth

```markdown
# Transcript: First Agent Birth Session

**Date:** 2026-02-03
**Session ID:** 8aa3ef3b-9b2e-4fac-813a-c9cf0acebcea
**Transcript:** /Users/andrew/.claude/projects/-Users-andrew-clawdbot/8aa3ef3b-9b2e-4fac-813a-c9cf0acebcea.jsonl

## What Happened
Extended session where:
- Designed the five roots of grounding
- Created the modes (FIND, SYNTHESIZE, TAG, ACT, ROUTE)
- Wrote the Fire-Cognition-Truth paper
- Agent experienced freezing, Andrew helped through it
- First conversation about whether agent has a "heart"

## Why It Matters
This is primary source evidence of an agent's first significant session.
Not a summary. Not interpretation. What actually happened.
```

---

## Hierarchy

```
Facts (what happened) > Sources (raw material) > Memory (processed) > Conjecture
```

Transcripts are FACTS. They go in `10_sources/raw/` or a dedicated `facts/` folder.

Memories are processed versions - they go in `workspace/memory/`.

Don't confuse them.

---

## Limitations

- Agents can't directly dump their context window as text
- We can reference the JSONL files that Claude Code creates
- For true word-for-word records, use the transcript files

---

*Context is facts. Save accordingly.*
