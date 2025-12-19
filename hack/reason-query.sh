#!/bin/bash
# Assembles reason query from mental models system prompt + user query + optional context
# Usage: reason-query.sh "query text" ["context text"]
# Always uses mental models prompt with GPT-5.1 high reasoning
# Outputs: REASON_ID to stdout
# Creates: /tmp/reason-query-${REASON_ID}.md

set -e

REASON_ID=$(date +%s%N)
QUERY_FILE="/tmp/reason-query-${REASON_ID}.md"

# Always use mental models system prompt - never changes
SYSTEM_PROMPT="$HOME/.claude/prompts/mental-models-system-prompt.md"

# System prompt
cat "$SYSTEM_PROMPT" > "$QUERY_FILE"

# Separator and query section
cat >> "$QUERY_FILE" << 'EOF'

---

## Query

Apply the mental models framework to analyze the following:

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

# Instructions for structured output
cat >> "$QUERY_FILE" << 'EOF'

---

## Response Requirements

Structure your analysis using relevant mental models:

1. **Problem Framing**: What are we actually solving? (First Principles)
2. **Key Analysis**: Apply the most relevant mental models
3. **Recommendation**: Clear, actionable conclusion
4. **Risks & Considerations**: What could go wrong, second-order effects
5. **Confidence Assessment**: How certain are you and why?

Be direct. Commit to decisions. Include everything needed to act.
EOF

echo "$REASON_ID"
