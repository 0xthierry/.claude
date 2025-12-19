# Command Pattern Analysis

This document identifies the common patterns used across Claude Code slash commands to ensure consistency and best practices.

## Pattern Categories

### 1. Frontmatter Structure

All commands use YAML frontmatter with:

```yaml
---
description: Brief description of what the command does (required)
model: opus|sonnet|haiku (optional - defaults to inherit)
---
```

**Purpose**: Provides metadata for command discovery and model selection.

**Examples**:
- `description: Create git commits with user approval and no Claude attribution`
- `description: Perform comprehensive security reviews and save results to review files`
- `model: opus` (for complex analysis tasks)

---

### 2. Initial Response Pattern

Many commands check for parameters and provide helpful guidance when none are given.

**Structure**:
1. Check if parameters were provided
2. If yes → Proceed with workflow
3. If no → Provide helpful template/examples
4. Wait for user input OR proceed with defaults

**Example from code-review.md**:
```markdown
## Initial Response

When this command is invoked:

1. **Check if parameters were provided**:
   - If file paths or feature names provided → Proceed to review
   - If no parameters → Ask what to review

2. **If no parameters**, respond with:
[Helpful template with examples]
```

**Commands using this pattern**:
- `/code-review`
- `/create-plan`
- `/research-codebase`
- `/security-review`

---

### 3. Structured Workflow

Commands use clear, numbered steps or phases to define the execution flow.

**Common structures**:
- **Steps**: `### Step 1: Title`, `### Step 2: Title`
- **Phases**: `## Phase 1: Title`, `## Phase 2: Title`
- **Process sections**: `## Context Gathering`, `## Analysis`

**Example from describe-pr.md**:
```markdown
## Steps to follow:

1. **Read the PR description template:**
   [Details...]

2. **Identify the PR to describe:**
   [Details...]

3. **Check for existing description:**
   [Details...]
```

**Purpose**: Provides clear execution order and makes commands easy to follow.

---

### 4. File Naming Conventions

Consistent naming patterns for output files across different command types.

**Standard Format**: `{prefix}-{identifier}-YYYY-MM-DD-HHMM.md`

**Examples by command type**:
- Code reviews: `code-review-authentication-module-2025-01-15-1430.md`
- Security reviews: `security-review-pr-123-2025-01-15-1445.md`
- Plans: `2025-01-08-ENG-1478-parent-child-tracking.md`
- Research: `2025-01-08-authentication-flow.md`

**Identifier patterns**:
- Feature/module name: `authentication-module` (kebab-case)
- PR number: `pr-123`
- Branch name: `feature-auth`
- Ticket number: `ENG-1478-description`

**Get timestamp**: `date +%Y-%m-%d-%H%M`

**Output directories**:
- `./reviews/` - Code and security reviews
- `./plans/` - Implementation plans
- `./research/` - Codebase research
- `./prs/` - PR descriptions

---

### 5. Agent/Sub-task Orchestration

Commands that coordinate specialized agents for complex analysis.

**Pattern**:
1. Identify what needs analysis
2. Launch specialized agent(s) using Task tool
3. Wait for completion
4. Process and format results
5. Write to output file
6. Provide user summary

**Example from code-review.md**:
```markdown
### Step 2: Launch Code Quality Review

Launch code-quality-reviewer agent with Task tool:

"Perform comprehensive code quality review of these files:
[list all files with full paths]
...
Return complete review content (I will handle writing to file)"

Wait for code-quality-reviewer to complete.
```

**Specialized agents used**:
- `code-quality-reviewer` - Code quality analysis
- `security-reviewer` - Security vulnerability detection
- `codebase-locator` - Find relevant files
- `codebase-analyzer` - Understand implementations
- `codebase-pattern-finder` - Find similar patterns
- `web-search-researcher` - External research

**Key principle**: Command orchestrates, agent analyzes.

---

### 6. Output Format Specifications

Commands define exact output formats using markdown templates.

**Common elements**:
- YAML frontmatter with metadata
- Clear section headers
- File:line references
- Code snippets
- Summary sections
- Metadata sections

**Example from research-codebase.md**:
```markdown
---
date: [ISO timestamp]
researcher: [Name]
git_commit: [Hash]
branch: [Name]
topic: "[Topic]"
tags: [research, codebase, components]
status: complete
---

# Research: [Topic]

## Research Question
[Original query]

## Summary
[High-level findings]

## Detailed Findings
...
```

**Purpose**: Ensures consistent, parseable output that can be:
- Read by other tools/scripts
- Searched and filtered
- Tracked in version control
- Referenced in documentation

---

### 7. Metadata Collection

Commands collect and include git and system metadata for traceability.

**Common metadata**:
- Current timestamp (ISO format with timezone)
- Git commit hash
- Git branch name
- Repository name
- Author/reviewer information
- File statistics

**Collection methods**:

**Using script** (preferred for consistency):
```bash
hack/spec_metadata.sh
```

**Manual collection**:
```bash
date -Iseconds                    # Timestamp
git rev-parse HEAD                # Commit hash
git branch --show-current         # Branch name
gh repo view --json owner,name    # Repository info
git diff --stat                   # Change statistics
```

**Commands using metadata**:
- `/research-codebase` - Full frontmatter
- `/security-review` - Review metadata
- `/describe-pr` - PR context

---

### 8. Important Notes Section

Most commands include an "Important Notes" or "Important Guidelines" section.

**Common content**:
- Key principles and philosophy
- What to do / what NOT to do
- Edge case handling
- Tool usage guidelines
- Best practices reminders

**Example from implement-plan.md**:
```markdown
## Implementation Philosophy

Plans are carefully designed, but reality can be messy. Your job is to:
- Follow the plan's intent while adapting to what you find
- Implement each phase fully before moving to the next
- Verify your work makes sense in the broader codebase context
```

**Purpose**: Sets expectations and prevents common mistakes.

---

### 9. Verification & Success Criteria

Commands that implement or validate changes include verification steps.

**Two-tier verification pattern**:

**Automated Verification** (can be run by agents):
```markdown
- [ ] Tests pass: `make test`
- [ ] Linting passes: `make lint`
- [ ] Build succeeds: `npm run build`
```

**Manual Verification** (requires human):
```markdown
- [ ] Feature works correctly in UI
- [ ] Performance is acceptable
- [ ] No regressions in related features
```

**Pause for manual verification**:
```markdown
After completing all automated verification for a phase, pause and inform
the human that the phase is ready for manual testing.
```

**Commands using this**:
- `/implement-plan`
- `/validate-plan-implementation`
- `/describe-pr` (verification checklist)

---

### 10. User Interaction Patterns

Commands use consistent patterns for user communication.

**Common patterns**:

**Present → Ask → Proceed**:
```markdown
1. Present findings or plan
2. Ask for confirmation or feedback
3. Proceed based on response
```

**Iterative Refinement**:
```markdown
1. Generate initial draft
2. Present to user
3. Get feedback
4. Refine and repeat
5. Finalize when approved
```

**Error Handling**:
```markdown
If [condition]:
  STOP and present issue clearly:

  Expected: [what should be]
  Found: [actual situation]
  Why this matters: [explanation]

  How should I proceed?
```

**Example from create-plan.md**:
```markdown
### Step 5: Review

1. **Present the draft plan location**
2. **Iterate based on feedback**
3. **Continue refining** until the user is satisfied
```

---

### 11. File Reading Best Practices

Commands emphasize proper file reading to ensure complete context.

**Key principles**:

**Read files FULLY**:
```markdown
- **IMPORTANT**: Use the Read tool WITHOUT limit/offset parameters
- **NEVER** read files partially
- Read entire files to understand complete context
```

**Read before spawning sub-tasks**:
```markdown
1. **Read all mentioned files first:**
   - If user mentions specific files, read them FULLY first
   - **CRITICAL**: Read these files yourself before spawning sub-tasks
   - This ensures full context before decomposition
```

**Tool preferences**:
- Use `Read` tool (NOT `bash cat/head/tail`)
- Use `Grep` tool (NOT `bash grep/rg`)
- Use `Glob` tool (NOT `bash find/ls`)

**Commands emphasizing this**:
- `/create-plan` - "Read all context files COMPLETELY"
- `/research-codebase` - "Read mentioned files FULLY"
- `/implement-plan` - "Read files fully - never use limit/offset"

---

### 12. Example Flows Section

Many commands include concrete usage examples at the end.

**Structure**:
```markdown
## Example Flows

### Example 1: [Common scenario]
[Step-by-step interaction showing user input and assistant response]

### Example 2: [Edge case scenario]
[Another concrete example]

### Example 3: [Complex scenario]
[More detailed example]
```

**Example from security-review.md**:
```markdown
### Example 1: Review Current Branch
User: /security-review
Assistant: I'll perform a security review of the current branch changes.
[Shows complete interaction...]

### Example 2: Review Specific PR
User: /security-review 456
[Shows different interaction pattern...]
```

**Purpose**:
- Clarifies expected behavior
- Shows different usage patterns
- Helps users understand command capabilities
- Provides templates for responses

---

### 13. Risk/Severity Level Systems

Commands that assess quality or security use consistent severity levels.

**Security severity** (from security-review):
- **CRITICAL**: 3+ HIGH issues, authentication bypass, or RCE
- **HIGH**: 1-2 HIGH issues or sensitive data exposure
- **MEDIUM**: Only MEDIUM severity issues
- **LOW**: Minor defensive issues
- **CLEAN**: No vulnerabilities

**Code quality severity** (from code-review):
- **Critical**: Must fix before merge
- **Important**: Should fix soon
- **Minor**: Nice to have improvements

**Visual indicators**:
- 🔴 Red circle - Critical/High issues
- 🟡 Yellow circle - Medium issues
- ✅ Green check - Clean/passed
- ⚠️ Warning sign - Requires attention

---

### 14. Scope Determination Pattern

Commands that analyze code include scope validation.

**Pattern**:
1. Determine what to analyze (parameters, current branch, PR)
2. Validate scope (check if files exist, changes present)
3. Estimate complexity (file count, line count)
4. Present scope to user
5. Warn if unusually large
6. Proceed with analysis

**Example from security-review.md**:
```markdown
### Step 2: Pre-flight Validation

1. **Check for changes**
2. **Estimate scope**:
   - Count modified files
   - Check total diff size
   - If > 50 files or > 5000 lines, warn user
3. **Present scope to user**
```

**Purpose**: Sets expectations and prevents wasted work.

---

### 15. Summary Response Pattern

Commands provide concise summaries after completing work.

**Structure**:
```markdown
[Status indicator emoji] [Action] Complete - [Result]

Written to: `[file path]`

**[Quick Summary Section]**:
- Metric 1: [value]
- Metric 2: [value]
- Overall: [assessment]

[Conditional next steps based on results]

Full details in the [output file].
```

**Example from code-review.md**:
```markdown
✅ Code Review Complete

Written to: `reviews/code-review-[component]-[timestamp].md`

**Quick Summary**:
- Files Reviewed: X
- Critical Issues: X
- Important: X
- Overall: [assessment]

Full details in the review file.
```

**Conditional messaging**:
- If critical issues → Urgent action message
- If clean → Positive confirmation
- If medium issues → Suggest review

---

## Pattern Application Guidelines

### When Creating New Commands

1. **Start with frontmatter**: Always include description (and model if non-default)

2. **Add initial response**: If command can be called without parameters, provide helpful guidance

3. **Structure workflow**: Use numbered steps or phases for clarity

4. **Define file naming**: Follow `{prefix}-{identifier}-YYYY-MM-DD-HHMM.md` pattern

5. **Include metadata**: Collect git context and timestamps for traceability

6. **Orchestrate agents**: Use specialized agents for complex analysis, command handles orchestration

7. **Format output**: Define clear markdown structure with frontmatter

8. **Add important notes**: Document key principles and edge cases

9. **Show examples**: Include 2-3 concrete usage examples

10. **Provide summaries**: Give users clear, actionable feedback after completion

### Command Responsibilities Split

**Command should handle**:
- User interaction and parameter validation
- Scope determination and validation
- Agent orchestration
- File writing and organization
- Metadata collection
- Summary generation and user communication

**Agent should handle**:
- Deep analysis and research
- Complex reasoning and synthesis
- Technical assessment
- Detailed findings generation

### Quality Checklist

Before finalizing a new command, verify:

- [ ] Frontmatter includes description
- [ ] Initial response handles missing parameters
- [ ] Workflow has clear numbered steps
- [ ] File naming follows convention
- [ ] Output directory is specified
- [ ] Metadata collection is included
- [ ] Output format is clearly defined
- [ ] Important notes section exists
- [ ] At least 2 example flows are shown
- [ ] Summary response pattern is used
- [ ] File reading best practices are followed
- [ ] Agent orchestration is clear (if applicable)
- [ ] Verification steps are defined (if applicable)

## Pattern Evolution

These patterns emerged from analyzing:
- `/commit` - Git workflow and user approval
- `/describe-pr` - Template following and verification
- `/code-review` - Agent orchestration and file output
- `/create-plan` - Iterative refinement and metadata
- `/implement-plan` - Verification and progress tracking
- `/research-codebase` - Documentation focus and frontmatter
- `/security-review` - Risk assessment and scope validation

As new commands are created, these patterns may evolve. Document significant changes here.
