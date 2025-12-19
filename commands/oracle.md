---
description: Consult the Oracle (GPT-5.1) for deep analysis - code, architecture, strategy, or complex decisions
model: inherit
---

# Oracle

Invoke the Oracle (GPT-5.1 via Codex) for deep analysis.

## Initial Response

Arguments: `$ARGUMENTS`

1. **If no arguments provided**, respond with:

   What would you like the Oracle to analyze?

   **Coding (uses Codex-Max by default):**
   - `Review the authentication architecture in src/auth/`
   - `Debug this error: [paste error message]`
   - `Analyze the caching architecture in src/cache/`

   **General analysis (add "use gpt-5.1-high" for reasoning-heavy tasks):**
   - `use gpt-5.1-high to analyze: Should we build vs buy for [capability]?`
   - `use gpt-5.1-high to synthesize: What are the key findings from these research docs?`
   - `use gpt-5.1-high to advise: Best strategy for prioritizing our product backlog?`

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
- Assembling the query with the appropriate system prompt
- Invoking Codex with the correct model
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
- **Prompt selection**: Codex-Max uses the coding-optimized prompt; GPT-5.1 high uses the general-purpose prompt

---

## Using Different Models

By default, the Oracle uses `gpt-5.1-codex-max` with a coding-optimized prompt. For reasoning-heavy, non-coding tasks, users can request GPT-5.1 with high reasoning.

**Model selection:**

| Request | Model | Best for |
|---------|-------|----------|
| Default | `gpt-5.1-codex-max` | Code review, debugging, architecture |
| "use gpt-5.1-high" | `gpt-5.1` high reasoning | Strategy, research synthesis, decisions |

**If the user asks** to use "gpt-5.1-high" or requests "high reasoning":

Tell the oracle agent to use the alternate model. The agent will:
1. Use the general-purpose system prompt
2. Invoke Codex with: `-m gpt-5.1 -c model_reasoning_effort=high`

---

## Example Flows

### Example 1: Code Review (Codex-Max)

**User:** `/oracle Review the error handling patterns in src/api/`

**Assistant:** Spawns oracle agent with the query. Agent uses codex prompt, invokes Codex-Max, returns analysis. Assistant presents the code review.

### Example 2: Debug Assistance (Codex-Max)

**User:** `/oracle Debug this: TypeError: Cannot read property 'id' of undefined`

**Assistant:** Spawns oracle agent. No files mentioned, so agent proceeds with query only. Uses codex prompt for debugging format. Returns debugging strategies and likely causes.

### Example 3: Strategy Analysis (GPT-5.1 High)

**User:** `/oracle use gpt-5.1-high to analyze: Should we build vs buy for our authentication system?`

**Assistant:** Spawns oracle agent. Agent uses general-purpose prompt, invokes GPT-5.1 with high reasoning. Returns thorough strategic analysis with pros/cons and recommendation.

### Example 4: Research Synthesis (GPT-5.1 High)

**User:** `/oracle use gpt-5.1-high to synthesize the findings from ./research/market-analysis/`

**Assistant:** Spawns oracle agent. Agent resolves path, uses general-purpose prompt, invokes GPT-5.1 with high reasoning. Returns comprehensive synthesis of research documents.
