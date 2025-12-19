#!/bin/bash
# Assembles oracle query from system prompt + user query + optional context
# Usage: oracle-query.sh "query text" ["context text"] ["model_hint"]
# Model hints: "codex" (default), "general" (for gpt-5.1 high)
# Outputs: ORACLE_ID to stdout
# Creates: /tmp/oracle-query-${ORACLE_ID}.md

set -e

ORACLE_ID=$(date +%s%N)
QUERY_FILE="/tmp/oracle-query-${ORACLE_ID}.md"

# Select prompt based on model hint
MODEL_HINT="${3:-codex}"
if [ "$MODEL_HINT" = "general" ] || [ "$MODEL_HINT" = "high" ]; then
    SYSTEM_PROMPT="$HOME/.claude/prompts/oracle-system-prompt-general.md"
else
    SYSTEM_PROMPT="$HOME/.claude/prompts/oracle-system-prompt-codex.md"
fi

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
