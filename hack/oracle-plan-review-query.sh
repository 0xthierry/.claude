#!/bin/bash
# Assembles oracle plan review query from system prompt + plan file
# Usage: oracle-plan-review-query.sh "/absolute/path/to/plan.md"
# Outputs: ORACLE_ID to stdout
# Creates: /tmp/oracle-query-${ORACLE_ID}.md

set -e

PLAN_PATH="$1"
ORACLE_ID=$(date +%s%N)
QUERY_FILE="/tmp/oracle-query-${ORACLE_ID}.md"
SYSTEM_PROMPT="$HOME/.claude/prompts/oracle-plan-review-system-prompt.md"

# Verify plan exists
if [ ! -f "$PLAN_PATH" ]; then
    echo "Error: Plan file not found: $PLAN_PATH" >&2
    exit 1
fi

# System prompt
cat "$SYSTEM_PROMPT" > "$QUERY_FILE"

# Separator and plan section
cat >> "$QUERY_FILE" << 'EOF'

---

## Implementation Plan to Review

EOF

# Plan content from file
cat "$PLAN_PATH" >> "$QUERY_FILE"

echo "$ORACLE_ID"
