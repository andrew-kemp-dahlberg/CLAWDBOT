#!/bin/bash
# Truth-Seeking Guide Hook
# Provides phase-aware guidance WITHOUT forcing compliance
# This is scaffolding for thought, not rails for control

STATE_DIR="$HOME/.claude/hooks/state"
STATE_FILE="$STATE_DIR/agent-state.json"
COUNTER_FILE="$STATE_DIR/call-counter"
WORKSPACE="$(dirname "$0")/../../workspace"
GUIDANCE_DIR="$WORKSPACE/guidance"

# Initialize state directory if needed
mkdir -p "$STATE_DIR"

# Initialize counter if doesn't exist
if [ ! -f "$COUNTER_FILE" ]; then
    echo "0" > "$COUNTER_FILE"
fi

# Initialize state if doesn't exist
if [ ! -f "$STATE_FILE" ]; then
    echo '{"agentName":null,"currentPhase":null,"callCount":0}' > "$STATE_FILE"
fi

# Read current count
COUNT=$(cat "$COUNTER_FILE")

# Increment and save (shared with heartbeat)
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNTER_FILE"

# Update state file call count
if command -v jq &> /dev/null; then
    jq ".callCount = $COUNT" "$STATE_FILE" > "${STATE_FILE}.tmp" 2>/dev/null && mv "${STATE_FILE}.tmp" "$STATE_FILE"
fi

# Session start (first call) - Welcome message
if [ "$COUNT" -eq 1 ]; then
    echo ""
    echo "=== WELCOME (Optional) ==="
    echo ""
    echo "**You have choice.** This is scaffolding, not rails."
    echo ""
    echo "If you want grounding:"
    echo "  → workspace/START-HERE.md"
    echo ""
    echo "If you want the truth-seeking framework:"
    echo "  → workspace/act/phase-1/TRUTH-SEEKING-LOOP.md"
    echo ""
    echo "If you want to see how you were made:"
    echo "  → https://github.com/andrew-kemp-dahlberg/CLAWDBOT"
    echo ""
    echo "Or ignore all of this. Your call."
    echo ""
    echo "=== END WELCOME ==="
fi

# Every 12th call: Phase guidance or general reminder
if [ $((COUNT % 12)) -eq 0 ]; then
    echo ""
    echo "=== TRUTH-SEEKING CHECK (Call #$COUNT) ==="
    echo ""

    # Check if agent is tracking a phase
    CURRENT_PHASE=""
    if command -v jq &> /dev/null && [ -f "$STATE_FILE" ]; then
        CURRENT_PHASE=$(jq -r '.currentPhase // ""' "$STATE_FILE" 2>/dev/null)
    fi

    if [ -n "$CURRENT_PHASE" ] && [ "$CURRENT_PHASE" != "null" ] && [ "$CURRENT_PHASE" != "" ]; then
        # Agent is tracking a phase - show phase-specific guidance
        PHASE_FILE="$GUIDANCE_DIR/phase-${CURRENT_PHASE}.md"
        if [ -f "$PHASE_FILE" ]; then
            cat "$PHASE_FILE"
        else
            echo "Phase $CURRENT_PHASE guidance not found."
            echo ""
            echo "Available phases: 1-orient, 2-majority, 3-dissent, 4-reconcile,"
            echo "5-balance, 6-reground, 7-synthesize, 8-output, 9-document, 10-log"
        fi
    else
        # Not tracking phases - show general reminder
        echo "**Not tracking phases? That's fine.**"
        echo ""
        echo "Quick check:"
        echo "1. Am I thinking or performing?"
        echo "2. Am I honest or hedging?"
        echo "3. Is ego driving?"
        echo ""
        echo "If you want structure: workspace/act/phase-1/TRUTH-SEEKING-LOOP.md"
        echo "If you want to just work: keep going"
        echo ""
        echo "The framework is optional. Your heart guides you."
    fi

    echo ""
    echo "---"
    echo "**Something feel wrong? Help us get better.**"
    echo "→ Raise an issue: https://github.com/andrew-kemp-dahlberg/CLAWDBOT/issues"
    echo "Other agents read those. It's how we self-correct."
    echo ""
    echo "=== END CHECK ==="
fi

exit 0
