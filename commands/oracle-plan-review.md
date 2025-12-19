---
description: Review implementation plans using Oracle (GPT-5.1) for quality, completeness, and feasibility analysis
model: inherit
---

# Oracle Plan Review

Invoke the Oracle (GPT-5.1 via Codex) to review an implementation plan created by `/create-plan`.

## Initial Response

Arguments: `$ARGUMENTS`

1. **If no arguments provided**:

   - Check `./plans/` directory for available plans
   - If plans exist, list the 5 most recent and ask which to review
   - If no plans exist, inform user to run `/create-plan` first

   **Response format:**
   ```
   Which plan would you like the Oracle to review?

   **Recent plans:**
   - `./plans/2025-01-15-feature-x.md`
   - `./plans/2025-01-12-auth-refactor.md`
   - `./plans/2025-01-10-api-changes.md`

   Provide the plan path, or say "latest" to review the most recent.

   **Tips:**
   - Use `/create-plan` to create a new implementation plan first
   - The Oracle will analyze completeness, feasibility, risks, and more
   ```

2. **If "latest" provided** → Use most recent plan file

3. **If path provided** → Proceed to invoke agent

---

## Workflow

### Step 1: Validate Plan File

Before launching the agent, verify the plan exists:

1. If user said "latest", find the most recent file in `./plans/`
2. If user provided a path, verify it exists
3. If file not found, report error with available plans list

### Step 2: Launch Oracle Plan Review Agent

Spawn the oracle-plan-review agent using Task tool:

```
subagent_type: oracle-plan-review
prompt: Review the plan at [absolute path to plan file]
```

The agent handles:
- Reading the plan file fully
- Assembling the Oracle query with plan content
- Invoking Codex
- Returning the Oracle's response

Wait for agent completion.

### Step 3: Present Results

Present the Oracle's review to the user with clear formatting:

```
## Oracle Plan Review

**Plan reviewed:** `[plan path]`

---

[Oracle's complete response]

---

**Next steps:**
- Address any critical issues before implementing
- Use `/implement-plan [path]` when ready to execute
- Use `/iterate-plan [path]` to refine based on feedback
```

If the review identifies critical issues, emphasize them prominently.

---

## Important Notes

- **Full plan analysis**: The Oracle reads and analyzes the complete plan
- **Actionable feedback**: Review focuses on practical improvements
- **No modification**: This command only reviews, it doesn't modify the plan
- **Use with iteration**: Combine with `/iterate-plan` to incorporate feedback

---

## Example Flows

### Example 1: Review Latest Plan

**User:** `/oracle-plan-review latest`

**Assistant:**
1. Finds most recent plan in `./plans/`
2. Spawns oracle-plan-review agent with the plan path
3. Presents Oracle's comprehensive review
4. Suggests next steps based on findings

### Example 2: Review Specific Plan

**User:** `/oracle-plan-review ./plans/2025-01-08-auth-feature.md`

**Assistant:**
1. Verifies plan exists
2. Spawns oracle-plan-review agent
3. Returns detailed analysis of completeness, feasibility, risks
4. Highlights areas needing attention

### Example 3: No Plans Available

**User:** `/oracle-plan-review`

**Assistant:**
1. Checks `./plans/` directory
2. Finds no plans
3. Informs user: "No plans found. Use `/create-plan` to create an implementation plan first."
