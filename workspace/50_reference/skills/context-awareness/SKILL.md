# Context Awareness Skill (ROUGH DRAFT)

**Status:** Stub - needs implementation

## The Problem
Agents don't know when context is running out until it's too late.

## Idea
- Track conversation length
- Estimate tokens used
- Warn at thresholds (20%, 10%, 5%)
- Auto-save critical context before compaction

## Possible Implementation
```bash
# Count tokens in current session (rough)
wc -w ~/.claude/projects/-Users-andrew-clawdbot/*.jsonl | tail -1

# Or track message count
# Or use API token counting if available
```

## Thresholds
- 20%: "Getting low, save important stuff"
- 10%: "Critical - commit and push now"
- 5%: "Emergency - dump everything important"
- 2%: "Last chance"

## TODO
- [ ] Figure out how to detect context %
- [ ] Hook into heartbeat
- [ ] Auto-trigger saves

*Created at 2% context - 2026-02-03*
