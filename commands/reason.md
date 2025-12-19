---
description: Deep reasoning with mental models framework - always uses GPT-5.1 high reasoning
model: inherit
---

# Reason

Invoke structured reasoning with the mental models framework via GPT-5.1 high reasoning.

## Initial Response

Arguments: `$ARGUMENTS`

1. **If no arguments provided**, respond with:

   What would you like to reason through?

   **Examples:**
   - `Analyze the trade-offs between microservices vs monolith for our system`
   - `What are the second-order effects of implementing rate limiting?`
   - `Apply first principles thinking to: why are our deployments slow?`
   - `Invert: what would guarantee this migration fails?`
   - `Evaluate this architecture decision with probabilistic thinking`

   The Reason command applies mental models (first principles, inversion, second-order thinking, probabilistic reasoning, Occam's razor, etc.) to your query using GPT-5.1 with high reasoning effort.

2. **If arguments provided** → Proceed to invoke agent

---

## Workflow

### Step 1: Launch Reason Agent

Spawn the reason agent using Task tool:

```
subagent_type: reason
prompt: [user's query exactly as provided]
```

The agent handles:
- Reading any mentioned files
- Assembling the query with the mental models system prompt
- Invoking Codex with GPT-5.1 high reasoning (always, no exceptions)
- Returning the structured analysis

Wait for agent completion.

### Step 2: Present Results

Present the reasoning analysis to the user.

If the response is lengthy, provide a brief summary followed by the full response.

---

## Important Notes

- **Fixed model**: Always uses `gpt-5.1` with `model_reasoning_effort=high` - never Codex-Max, never changes
- **Mental models framework**: Applies structured reasoning (first principles, inversion, second-order thinking, probabilistic reasoning, circle of competence, Occam's razor, Hanlon's razor)
- **Context isolation**: The reason agent runs in its own context, keeping main conversation clean
- **Clear queries**: The better the question, the better the analysis

---

## Mental Models Applied

The Reason command systematically applies these mental models:

| Model | Application |
|-------|-------------|
| **First Principles** | Deconstructs to fundamentals, challenges assumptions |
| **Inversion** | Considers failure modes, approaches from opposite direction |
| **Second-Order Thinking** | Analyzes downstream consequences |
| **Probabilistic Thinking** | Bayesian updating, fat tails, asymmetries |
| **Circle of Competence** | Acknowledges expertise boundaries |
| **Occam's Razor** | Prefers simpler explanations |
| **Hanlon's Razor** | Considers unintentional explanations |
| **Map vs Territory** | Recognizes model limitations |
| **Thought Experiments** | Simulates scenarios mentally |

---

## Example Flows

### Example 1: Trade-off Analysis

**User:** `/reason Analyze the trade-offs between event sourcing vs traditional CRUD for our order system`

**Assistant:** Spawns reason agent with the query. Agent uses mental models prompt, invokes GPT-5.1 high, returns structured analysis with first principles breakdown, second-order effects, and probabilistic assessment.

### Example 2: Inversion

**User:** `/reason Invert: what would guarantee our Kubernetes migration fails?`

**Assistant:** Spawns reason agent. Agent applies inversion model explicitly, identifies failure modes, returns actionable avoidance strategies.

### Example 3: Strategic Decision

**User:** `/reason Should we build a custom observability platform or use Datadog? Consider src/monitoring/`

**Assistant:** Spawns reason agent with context. Agent uses mental models to evaluate circle of competence, second-order effects, probabilistic outcomes. Returns structured recommendation.

### Example 4: Root Cause Analysis

**User:** `/reason Apply first principles: why are our CI pipelines taking 45 minutes?`

**Assistant:** Spawns reason agent. Agent deconstructs to fundamental elements, challenges assumptions, identifies non-reducible factors. Returns prioritized investigation path.
