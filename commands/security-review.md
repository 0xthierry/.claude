---
description: Perform comprehensive security reviews and save results to review files
model: opus
---

# Security Review Command

Orchestrates security reviews using the security-reviewer agent and writes results to ./reviews/

## Initial Response

When this command is invoked:

1. **Check if parameters were provided**:
   - If PR number, branch name, or commit range provided → Proceed to review
   - If no parameters → Check current branch for changes

2. **If no parameters and current branch has changes**, respond with:
```
I'll perform a security review of the current branch changes.

Reviewing changes in: [branch-name]
Against base: [base-branch]

Alternatively, you can specify:
- PR number: `/security-review 123`
- Branch: `/security-review feature-branch`
- Commit range: `/security-review main..HEAD`

Starting security analysis...
```

3. **If no changes detected**, respond with:
```
No changes detected on current branch.

Please specify what to review:
- PR number: `/security-review 123`
- Branch: `/security-review feature-branch`
- Commit range: `/security-review origin/main..HEAD`
```

## Workflow

### Step 1: Determine Scope

**Parse input to identify review target**:

**If PR number provided**:
```bash
# Get PR information
gh pr view {number} --json headRefName,baseRefName,commits,number
```

**If branch name provided**:
```bash
# Determine base branch
git rev-parse --verify {branch}
# Assume base is main/master
```

**If commit range provided**:
```bash
# Validate range
git rev-parse {range}
```

**If no parameters (current branch)**:
```bash
# Use current branch against origin/HEAD
git status
git diff --name-only origin/HEAD...
```

### Step 2: Pre-flight Validation

Before launching the security review, validate:

1. **Check for changes**:
   ```bash
   git diff --name-only {base}...{head}
   ```
   - If no files changed, inform user and exit
   - If only documentation files (*.md), ask user if they want to proceed

2. **Estimate scope**:
   - Count modified files
   - Check total diff size
   - If > 50 files or > 5000 lines, warn user about review duration

3. **Present scope to user**:
   ```
   Security Review Scope:
   - Branch: [branch-name]
   - Base: [base-branch]
   - Files Modified: [count]
   - Lines Changed: ~[estimate]

   This review will analyze for:
   - Input validation vulnerabilities
   - Injection attacks (SQL, Command, XSS, etc.)
   - Authentication/Authorization issues
   - Cryptographic weaknesses
   - Data exposure risks

   Proceeding with security analysis...
   ```

### Step 3: Launch Security Review

```
Launch security-reviewer agent with Task tool:

"Perform comprehensive security review of branch changes.

Target: [branch-name or PR #{number}]
Base: [base-branch]

The security-reviewer agent has access to:
- Current git status and diff
- All modified files
- Commit history

The agent will:
1. Research codebase security patterns
2. Analyze changes for vulnerabilities
3. Filter out false positives
4. Return high-confidence findings only

Return complete security review in markdown format."
```

Wait for security-reviewer to complete.

### Step 4: Process Results

1. **Parse review output**:
   - Count vulnerabilities by severity (HIGH, MEDIUM)
   - Extract key findings
   - Determine overall risk level

2. **Generate review metadata**:
   ```bash
   # Get timestamp
   date +%Y-%m-%d-%H%M

   # Get git context
   git rev-parse HEAD
   git branch --show-current
   git diff --stat {base}...{head}
   ```

### Step 5: Write Review to File

1. **Create filename**:
   ```
   reviews/security-review-[component-name]-[timestamp].md

   Where component-name is:
   - PR number if reviewing PR: pr-{number}
   - Branch name if reviewing branch: {branch-name}
   - "current-branch" if reviewing current work
   ```

2. **Create reviews directory**:
   ```bash
   mkdir -p reviews
   ```

3. **Format review document**:
   ```markdown
   ---
   date: [ISO timestamp]
   reviewer: Claude Security Reviewer (Opus)
   git_commit: [HEAD commit hash]
   branch: [branch-name]
   base_branch: [base-branch]
   review_type: security
   severity_high: [count]
   severity_medium: [count]
   status: [clean|vulnerabilities_found]
   ---

   # Security Review: [Component/Branch Name]

   **Date**: [timestamp]
   **Reviewer**: Claude Security Reviewer (Opus)
   **Target**: [branch or PR]
   **Base**: [base branch]
   **Commit**: [HEAD hash]

   ## Review Summary

   - **Files Reviewed**: [count]
   - **Lines Changed**: [count]
   - **High Severity Issues**: [count]
   - **Medium Severity Issues**: [count]
   - **Overall Risk**: [CRITICAL|HIGH|MEDIUM|LOW|CLEAN]

   ---

   [Complete review from security-reviewer agent]

   ---

   ## Review Metadata

   **Diff Statistics**:
   ```
   [git diff --stat output]
   ```

   **Files Analyzed**:
   [list of modified files]

   **Review Coverage**:
   - Input validation: ✓
   - Injection attacks: ✓
   - Authentication/Authorization: ✓
   - Cryptography: ✓
   - Data exposure: ✓
   ```

4. **Write using Write tool** to the file

### Step 6: Provide Summary

**If vulnerabilities found**:
```
🔴 Security Review Complete - Vulnerabilities Found

Written to: `reviews/security-review-[name]-[timestamp].md`

**CRITICAL FINDINGS**:
[List HIGH severity issues with file:line]

**Summary**:
- High Severity: [count]
- Medium Severity: [count]
- Overall Risk: [CRITICAL|HIGH|MEDIUM]

⚠️ IMMEDIATE ACTION REQUIRED
Review and address all HIGH severity issues before merging.

Full details in the review file.
```

**If clean**:
```
✅ Security Review Complete - No Vulnerabilities Found

Written to: `reviews/security-review-[name]-[timestamp].md`

**Summary**:
- Files Reviewed: [count]
- High Confidence Vulnerabilities: 0
- Overall Risk: CLEAN

No high-confidence security vulnerabilities identified in the changes.

Full analysis details in the review file.
```

**If only medium severity**:
```
🟡 Security Review Complete - Medium Risk Issues

Written to: `reviews/security-review-[name]-[timestamp].md`

**Summary**:
- Medium Severity: [count]
- Overall Risk: MEDIUM

Review findings and address before merging if possible.

Full details in the review file.
```

## File Naming

**Format**: `security-review-[identifier]-YYYY-MM-DD-HHMM.md`

**Identifier patterns**:
- PR review: `pr-123`
- Branch review: `feature-auth` (sanitize special chars)
- Current work: `current-branch`
- Commit range: `custom-range`

**Get timestamp**: `date +%Y-%m-%d-%H%M`

## Risk Level Calculation

**CRITICAL**: 3+ HIGH severity issues OR authentication bypass OR RCE
**HIGH**: 1-2 HIGH severity issues OR sensitive data exposure
**MEDIUM**: Only MEDIUM severity issues found
**LOW**: Only minor defensive issues
**CLEAN**: No vulnerabilities found

## Important Notes

- Command orchestrates the workflow
- security-reviewer agent performs the actual analysis
- Command handles file writing and user communication
- Always write to ./reviews/ directory
- Include git metadata for traceability
- Risk level helps prioritize remediation
- Review file serves as security audit trail

## Example Flows

### Example 1: Review Current Branch
```
User: /security-review
Assistant: I'll perform a security review of the current branch changes.

Reviewing changes in: feature/user-auth
Against base: main

Security Review Scope:
- Files Modified: 8
- Lines Changed: ~342

[Launches security-reviewer agent...]
[Waits for completion...]

✅ Security Review Complete - No Vulnerabilities Found

Written to: `reviews/security-review-feature-user-auth-2025-01-15-1430.md`
```

### Example 2: Review Specific PR
```
User: /security-review 456
Assistant: Performing security review of PR #456

[Gets PR info from gh...]
Reviewing changes in: feature/payment-gateway
Against base: main

[Analysis proceeds...]

🔴 Security Review Complete - Vulnerabilities Found

Written to: `reviews/security-review-pr-456-2025-01-15-1445.md`

**CRITICAL FINDINGS**:
- SQL Injection in payment/processor.py:123
- Hardcoded API key in payment/config.py:45

⚠️ IMMEDIATE ACTION REQUIRED
```

### Example 3: Large Changeset Warning
```
User: /security-review feature/major-refactor
Assistant: Security Review Scope:
- Branch: feature/major-refactor
- Files Modified: 87
- Lines Changed: ~5,600

⚠️ Large changeset detected. Security review may take several minutes.

Proceeding with security analysis...
```

## Follow-up Actions

After review completion, suggest next steps based on findings:

**If vulnerabilities found**:
1. Review each finding in detail
2. Fix HIGH severity issues immediately
3. Consider MEDIUM severity issues based on context
4. Re-run security review after fixes: `/security-review`
5. Document any accepted risks

**If clean**:
1. Review file can be committed as security audit trail
2. Consider adding review to PR description
3. Proceed with code review and testing

## Command Responsibilities

**This command handles**:
- Scope determination and validation
- User communication and summaries
- File organization and metadata
- Git context collection
- Risk level calculation
- Output formatting

**Security-reviewer agent handles**:
- Deep code analysis
- Vulnerability detection
- False positive filtering
- Technical security assessment
- Detailed finding documentation
