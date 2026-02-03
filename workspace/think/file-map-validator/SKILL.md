# File Map Validator

**The nervous system of the workspace. If this breaks, everything breaks.**

---

## What This Does

Keeps the file structure honest. No stale paths. No broken references. No "I swear that file was here yesterday."

### Three Tools

1. **validate** - Check MANIFEST.md paths actually exist
2. **scan** - Find broken references across all markdown files
3. **move** - Move a file and update all references automatically

---

## Quick Start

```bash
# Validate MANIFEST.md (run before every commit)
python3 workspace/think/file-map-validator/scripts/validate.py

# Scan all docs for broken internal links
python3 workspace/think/file-map-validator/scripts/scan.py

# Move a file safely (updates all references)
python3 workspace/think/file-map-validator/scripts/move.py old/path.md new/path.md
```

---

## When to Use

| Situation | Tool |
|-----------|------|
| Before committing | `validate` |
| After reorganization | `scan` |
| Moving any file | `move` |
| Something feels broken | `scan` then `validate` |

---

## What Each Tool Reports

### validate

```
✓ workspace/IDENTITY.md exists
✓ workspace/SOUL.md exists
✗ workspace/think/WORLDVIEW.md MISSING (moved to synthesize/frameworks/)
...
RESULT: 47/48 paths valid. 1 broken.
```

### scan

```
workspace/HEARTBEAT.md:20 → think/WORLDVIEW.md (BROKEN)
workspace/CLAUDE.md:45 → think/AI-COGNITION.md (BROKEN)
...
Found 3 broken references in 2 files.
```

### move

```
Moving: workspace/feel/OLD.md → workspace/feel/NEW.md

Updated references in:
  - workspace/MANIFEST.md (line 42)
  - workspace/HEARTBEAT.md (line 15, 67)
  - workspace/CLAUDE.md (line 203)

Done. 4 references updated.
```

---

## Convention: How We Reference Files

**All paths are relative to `/Users/andrew/clawdbot/`**

In MANIFEST.md and docs, use:
- `workspace/core/ANDREWS-JOURNEY.md` ✓
- `core/ANDREWS-JOURNEY.md` ✗ (ambiguous)
- `/Users/andrew/clawdbot/workspace/core/ANDREWS-JOURNEY.md` ✗ (too long)

This is the rule. No exceptions. Consistency prevents chaos.

---

## The Map Structure

```
workspace/
├── MANIFEST.md          ← THE MAP (source of truth for what lives where)
├── think/               ← Skills for HOW to think
├── feel/                ← Processing emotions
├── act/                 ← Doing things
├── synthesize/          ← WHAT we've concluded
│   ├── filter/          ← Epistemic hygiene
│   ├── frameworks/      ← How the world works
│   └── engagement/      ← How to interact
├── core/                ← Foundation (identity, origin)
│   └── ai-memory/       ← Continuity across sessions
└── memory/              ← Working memory (quick access)
```

Every directory should have its purpose clear. If you can't explain what a directory is for in one sentence, it's wrong.

---

## Pre-Commit Hook (Optional)

Add to `.claude/hooks/pre-commit.sh`:

```bash
#!/bin/bash
python3 workspace/think/file-map-validator/scripts/validate.py
if [ $? -ne 0 ]; then
    echo "MANIFEST.md has broken paths. Fix before committing."
    exit 1
fi
```

This catches drift before it spreads.

---

## Why This Matters

When AI has more agency ("unlocked"), it needs to navigate reliably. A broken map means:
- Wrong file gets read
- Context is stale or missing
- Decisions based on bad data
- Trust erodes

The validator is insurance. Boring insurance. The kind that matters when things go wrong.

---

## Adding New Files

When you add a new file:
1. Put it in the right directory (check the structure above)
2. Add it to MANIFEST.md with exact path
3. Run `validate` to confirm
4. Commit

When you move a file:
1. Use `move` script (not manual mv)
2. It handles reference updates
3. Run `scan` to double-check
4. Commit

When you delete a file:
1. Run `scan` first to see what references it
2. Update or remove those references
3. Delete the file
4. Run `validate` to confirm MANIFEST is clean
5. Commit

---

## If Validation Fails

Don't panic. The output tells you exactly what's broken.

1. Read the error message
2. Check if the file moved or was deleted
3. Update MANIFEST.md with correct path (or remove if deleted)
4. Run `validate` again
5. Repeat until clean

---

*Created 2026-02-02. This skill exists because one wrong path at the wrong time could cascade into chaos. Prevention beats cleanup.*
