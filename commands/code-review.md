---
description: Perform comprehensive code quality reviews and save results to review files
model: opus
---

# Code Review Command

Orchestrates code quality reviews using the code-quality-reviewer agent.

## Workflow

**If no parameters**, respond: "Specify what to review (files, directory, or feature name)"

**Otherwise**:

1. **Launch agent** with minimal prompt:
   ```
   Review code quality for: [user's parameter]

   Use git to identify relevant files.
   Return complete review (I will handle file writing).
   ```

2. **Wait for agent** to complete review

3. **Infer component name** from agent's output (kebab-case):
   - Extract from files reviewed or use parameter
   - Examples: `authentication-module`, `api-endpoints`, `payment-processing`

4. **Get timestamp**: `date +%Y-%m-%d-%H%M`

5. **Write review** to `reviews/code-review-[component]-[timestamp].md`:
   ```markdown
   # Code Review: [Component]

   **Date**: [timestamp]
   **Reviewer**: Claude Code Quality Reviewer (Opus)

   ---

   [Agent output]
   ```

6. **Summarize to user**:
   - File path: `reviews/code-review-[component]-[timestamp].md`
   - Critical/Important/Minor counts
   - Overall assessment

## Key Principles

- Keep agent prompt minimal - it knows its job
- Agent identifies files using git
- Command only handles file writing and summary
- Create reviews dir: `mkdir -p reviews`
