---
description: Consult the Oracle (GPT-5.1) for deep analysis, architecture review, or complex debugging
model: inherit
---

# Oracle

Invoke the Oracle (GPT-5.1 via Codex) for deep analysis.

## Initial Response

Arguments: `$ARGUMENTS`

1. **If no arguments provided**, respond with:

   What would you like the Oracle to analyze?

   **Examples:**
   - `Review the authentication architecture in src/auth/`
   - `Debug this error: [paste error message]`
   - `Analyze tradeoffs between approach A and B for [feature]`
   - `Deep dive into performance bottleneck in [component]`

   Provide your query, optionally mentioning specific files for context.

2. **If arguments provided** → Proceed to invoke agent

---

## Workflow

### Step 1: Launch Oracle Agent

Spawn the oracle agent using Task tool:

```
subagent_type: oracle
prompt: [user's query exactly as provided]
```

The agent handles:
- Reading any mentioned files
- Assembling the query with system prompt
- Invoking Codex
- Returning the Oracle's response

Wait for agent completion.

### Step 2: Present Results

Present the Oracle's response to the user.

If the response is lengthy, provide a brief summary followed by the full response.

---

## Important Notes

- **Context isolation**: The oracle agent runs in its own context, keeping main conversation clean
- **Minimal context**: Agent only reads files explicitly mentioned in query
- **Clear queries**: The better the question, the better the Oracle's analysis

---

## Using Different Models

By default, the Oracle uses `gpt-5.1-codex-max`. Users may request a different model with higher reasoning effort.

**If the user asks** to use a model like "gpt-5.1-high" or requests "high reasoning":

Tell the oracle agent to use the alternate model. The agent should change the codex command to:

```bash
codex exec --sandbox read-only -m gpt-5.1 -c model_reasoning_effort=high -o /tmp/oracle-${ORACLE_ID}.md "$(cat /tmp/oracle-query-${ORACLE_ID}.md)"
```

**Available configurations:**
| Request | Command flags |
|---------|---------------|
| Default | `-m gpt-5.1-codex-max` |
| High reasoning | `-m gpt-5.1 -c model_reasoning_effort=high` |

---

## Example Flows

### Example 1: Architecture Review

**User:** `/oracle Review the error handling patterns in src/api/`

**Assistant:** Spawns oracle agent with the query. Agent reads relevant files, invokes Oracle, returns analysis. Assistant presents the architectural review.

### Example 2: Debug Assistance

**User:** `/oracle Debug this: TypeError: Cannot read property 'id' of undefined`

**Assistant:** Spawns oracle agent. No files mentioned, so agent proceeds with query only. Returns debugging strategies and likely causes.

### Example 3: Design Decision

**User:** `/oracle Should I use Redis or PostgreSQL for session storage? See src/config/database.ts`

**Assistant:** Spawns oracle agent. Agent reads the config file, includes as context, invokes Oracle. Returns tradeoff analysis with recommendation.
