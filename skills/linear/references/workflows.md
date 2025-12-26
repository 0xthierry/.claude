# Linear Workflows

## Contents
- [Daily Standup](#daily-standup) (line 15)
- [Issue Triage](#issue-triage) (line 37)
- [Sprint Planning](#sprint-planning) (line 64)
- [Issue Update Flow](#issue-update-flow) (line 90)
- [Assignment Workflow](#assignment-workflow) (line 118)
- [Project Review](#project-review) (line 140)
- [Label Management](#label-management) (line 164)
- [Comment Discussion](#comment-discussion) (line 192)

---

## Daily Standup

```
- [ ] Check my active issues
- [ ] Review cycle progress
- [ ] Identify blockers
```

```bash
# My issues
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const issues = await linear.listIssues({ assignee: 'me', state: 'active' })
  console.log(JSON.stringify(issues, null, 2))
"

# Cycle progress
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const metrics = await linear.getCycleMetrics({ team: 'ENG' })
  console.log('Progress:', metrics.progress + '%', 'Status:', metrics.burndownStatus)
"
```

## Issue Triage

```
- [ ] Search for duplicates
- [ ] Create with proper fields
- [ ] Verify creation
```

```bash
# Search first
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const results = await linear.searchIssues('brief description')
  console.log(JSON.stringify(results, null, 2))
"

# Create if no duplicate
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const issue = await linear.createIssue({
    team: 'ENG',
    title: 'Clear title',
    description: '## Context\\n\\n## Steps\\n\\n## Expected',
    priority: 'high'
  })
  console.log('Created:', issue.identifier, issue.url)
"
```

## Sprint Planning

```
- [ ] Team overview
- [ ] Project health
- [ ] High-priority backlog
```

```bash
# Teams
bun --preload ~/.claude/skills/linear/preload.ts -e "
  console.log(JSON.stringify(await linear.listTeams(), null, 2))
"

# Projects
bun --preload ~/.claude/skills/linear/preload.ts -e "
  console.log(JSON.stringify(await linear.listProjects({ status: 'active' }), null, 2))
"

# Backlog
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const issues = await linear.listIssues({ state: 'backlog', priority: 'high', limit: 20 })
  console.log(JSON.stringify(issues, null, 2))
"
```

## Issue Update Flow

```
- [ ] Get current issue state
- [ ] Discover valid states
- [ ] Apply update
```

```bash
# View issue details
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const issue = await linear.getIssue('ENG-123')
  console.log(JSON.stringify(issue, null, 2))
"

# Get team states
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const states = await linear.getTeamStates('ENG')
  console.log(JSON.stringify(states, null, 2))
"

# Update issue
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const updated = await linear.updateIssue('ENG-123', { state: 'In Progress' })
  console.log('Updated:', updated.identifier)
"
```

## Assignment Workflow

```
- [ ] Find user by name
- [ ] Confirm correct match
- [ ] Assign issue
```

```bash
# Resolve user
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const result = await linear.resolveUser('john')
  console.log(JSON.stringify(result, null, 2))
"

# Assign to me
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const updated = await linear.updateIssue('ENG-123', { assignee: 'me' })
  console.log('Assigned:', updated.identifier)
"
```

## Project Review

```
- [ ] Check project health
- [ ] Review issue breakdown
- [ ] Analyze velocity trend
```

```bash
# Project details
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const project = await linear.getProject('Q1 Launch')
  console.log(JSON.stringify(project, null, 2))
"

# Project metrics
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const metrics = await linear.getProjectMetrics('Q1 Launch')
  console.log('Progress:', metrics.progress + '%')
  console.log('Trend:', metrics.trend)
  console.log('Velocity:', metrics.velocity)
"
```

## Label Management

```
- [ ] Discover available labels
- [ ] Add labels to issue
- [ ] Remove labels if needed
```

```bash
# Get team labels
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const labels = await linear.getTeamLabels('ENG')
  console.log(JSON.stringify(labels, null, 2))
"

# Add labels
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const updated = await linear.updateIssue('ENG-123', { addLabels: ['bug', 'urgent'] })
  console.log('Labels added:', updated.identifier)
"

# Remove labels
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const updated = await linear.updateIssue('ENG-123', { removeLabels: ['wontfix'] })
  console.log('Labels removed:', updated.identifier)
"
```

## Comment Discussion

```
- [ ] View existing comments
- [ ] Add new comment
```

```bash
# List comments
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const comments = await linear.listComments('ENG-123')
  console.log(JSON.stringify(comments, null, 2))
"

# Add comment
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const comment = await linear.addComment('ENG-123', 'Fix is ready in PR #456')
  console.log('Comment added:', comment.url)
"
```
