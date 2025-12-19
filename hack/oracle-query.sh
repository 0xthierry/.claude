#!/bin/bash
# Assembles oracle query from system prompt + user query + optional context
# Usage: oracle-query.sh "query text" ["context text"]
# Outputs: ORACLE_ID to stdout
# Creates: /tmp/oracle-query-${ORACLE_ID}.md

set -e

ORACLE_ID=$(date +%s%N)
QUERY_FILE="/tmp/oracle-query-${ORACLE_ID}.md"
SYSTEM_PROMPT="$HOME/.claude/prompts/oracle-system-prompt.md"

# System prompt
cat "$SYSTEM_PROMPT" > "$QUERY_FILE"

# Separator and query section
cat >> "$QUERY_FILE" << 'EOF'

---

## Query

EOF

# User query
echo "$1" >> "$QUERY_FILE"

# Context if provided
if [ -n "$2" ]; then
    cat >> "$QUERY_FILE" << 'EOF'

## Context

EOF
    echo "$2" >> "$QUERY_FILE"
fi

echo "$ORACLE_ID"
