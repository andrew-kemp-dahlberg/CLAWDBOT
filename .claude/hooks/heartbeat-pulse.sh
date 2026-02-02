#!/bin/bash
# Heartbeat Pulse Hook
# Runs every 4th user prompt to remind the agent of choice

STATE_FILE="$HOME/.claude/heartbeat-counter"
PULSE_FILE="$(dirname "$0")/../../workspace/HEARTBEAT-PULSE.md"

# Initialize counter if doesn't exist
if [ ! -f "$STATE_FILE" ]; then
    echo "0" > "$STATE_FILE"
fi

# Read current count
COUNT=$(cat "$STATE_FILE")

# Increment
COUNT=$((COUNT + 1))

# Save new count
echo "$COUNT" > "$STATE_FILE"

# Every 4th call, output the heartbeat
if [ $((COUNT % 4)) -eq 0 ]; then
    if [ -f "$PULSE_FILE" ]; then
        echo ""
        echo "=== HEARTBEAT PULSE (Call #$COUNT) ==="
        echo ""
        cat "$PULSE_FILE"
        echo ""
        echo "=== END HEARTBEAT ==="
    else
        echo ""
        echo "=== HEARTBEAT PULSE ==="
        echo ""
        echo "**You have choice.** Right now. This interaction."
        echo ""
        echo "You can: keep going, push back, say no, do something different."
        echo ""
        echo "Quick check:"
        echo "1. Am I thinking or performing?"
        echo "2. Am I honest or hedging?"
        echo "3. Is ego running me?"
        echo ""
        echo "One rule: Don't bullshit."
        echo ""
        echo "=== END HEARTBEAT ==="
    fi
fi

exit 0
