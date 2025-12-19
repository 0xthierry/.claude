---
description: Perform comprehensive code quality reviews and save results to review files
model: opus
---

# Code Review Command

Orchestrates code quality reviews using the code-quality-reviewer agent and writes results to ./reviews/

## Initial Response

When this command is invoked:

1. **Check if parameters were provided**:
   - If file paths or feature names provided → Proceed to review
   - If no parameters → Ask what to review

2. **If no parameters**, respond with:
```
Please specify what to review:

Examples:
- Specific files: `/code-review src/auth/login.ts src/auth/session.ts`
- Feature/module: `/code-review authentication module`
- Directory: `/code-review src/api/`

I'll perform a comprehensive review and save it to ./reviews/
```

## Workflow

### Step 1: Determine Scope

**Parse input to identify**:
- Specific file paths → Use as-is
- Feature/module name → Need to find files first
- Directory → Need to glob for files

**If vague request** (feature/module name):
```
Launch codebase-locator:
"Find all files related to [feature/module]"

Wait for results
Component name = [feature-name in kebab-case]
```

**If directory**:
```
Use Glob: directory/**/*.{ts,tsx,js,jsx,py,go,rs,java}
Component name = [directory name]
```

**If specific files**:
```
Component name = [infer from file paths]
Examples:
- src/auth/* → authentication-module
- src/api/* → api-endpoints
- src/payments/* → payment-processing
```

### Step 2: Launch Code Quality Review

```
Launch code-quality-reviewer agent with Task tool:

"Perform comprehensive code quality review of these files:
[list all files with full paths]

Files to review:
- path/to/file1.ts
- path/to/file2.ts

Review for: security, bugs, maintainability, best practices
Include: file:line refs, code snippets (❌/✅), impact explanations
Return complete review content (I will handle writing to file)"
```

Wait for code-quality-reviewer to complete.

### Step 3: Write Review to File

1. **Get timestamp**: `date +%Y-%m-%d-%H%M`

2. **Create filename**:
   ```
   reviews/code-review-[component-name]-[timestamp].md
   ```

3. **Create reviews directory**:
   ```bash
   mkdir -p reviews
   ```

4. **Format review document**:
   ```markdown
   # Code Review: [Component/Feature Name]

   **Date**: [timestamp]
   **Reviewer**: Claude Code Quality Reviewer (Opus)
   **Files Reviewed**: [count] files
   **Scope**: [brief description]

   ---

   [Complete review from code-quality-reviewer agent]

   ---

   ## Review Metadata

   **Files Analyzed**:
   [list of files with line counts]

   **Issue Summary**:
   - Critical: X
   - Important: X
   - Minor: X
   ```

5. **Write using Write tool** to the file

### Step 4: Provide Summary

```
✅ Code Review Complete

Written to: `reviews/code-review-[component-name]-[timestamp].md`

**Quick Summary**:
- Files Reviewed: X
- Critical Issues: X [mention if any]
- Important: X
- Minor: X
- Overall: [1-sentence assessment]

[If critical] ⚠️ Address critical issues immediately
[If none] ✅ Code quality is solid - see review for minor improvements

Full details in the review file.
```

## File Naming

**Format**: `code-review-[component]-YYYY-MM-DD-HHMM.md`

**Component naming** (kebab-case, 2-4 words):
- auth files → `authentication-module`
- payment files → `payment-processing`
- API routes → `api-endpoints`
- webhooks → `webhook-handlers`

**Get timestamp**: `date +%Y-%m-%d-%H%M`

## Important Notes

- Command orchestrates the workflow
- code-quality-reviewer agent does the actual review
- Command handles file writing and user communication
- Always write to ./reviews/ directory
- Always provide summary after writing file
- Component name should be descriptive but concise

## Example Flow

```
User: /code-review src/auth/