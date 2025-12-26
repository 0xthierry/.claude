---
name: linear
description: Manage Linear issues, projects, and metrics. Use when user mentions Linear, issues, tickets, sprints, cycles, project tracking, or task management in Linear.
---

# Using Linear

Manage Linear issues, projects, cycles, and team metrics using the Linear SDK.

## Setup

1. Get your API key: https://linear.app/settings/api
2. Create `.env` in the skill folder:
   ```bash
   echo "LINEAR_API_KEY=lin_api_xxxxx" > ~/.claude/skills/linear/.env
   ```

## Quick Start

All operations use the preload pattern with `bun`:

```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "CODE_HERE"
```

### Preflight Check (Start Here)
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  console.log(JSON.stringify(await linear.preflight(), null, 2))
"
```
This returns your user info, organization, all teams (with keys), and rate limit status.

### List My Active Issues
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const issues = await linear.listIssues({ assignee: 'me', state: 'active' })
  console.log(JSON.stringify(issues, null, 2))
"
```

### Create Issue
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const issue = await linear.createIssue({
    team: 'ENG',
    title: 'Bug: Login fails on mobile',
    description: '## Steps to reproduce\\n1. Open app on mobile\\n2. Try to login',
    priority: 'high'
  })
  console.log('Created:', issue.identifier, issue.url)
"
```

### Search Issues
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const results = await linear.searchIssues('authentication bug')
  console.log(JSON.stringify(results, null, 2))
"
```

### Get Project Metrics
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const metrics = await linear.getProjectMetrics('Q1 Launch')
  console.log(JSON.stringify(metrics, null, 2))
"
```

## Available Functions

See [REFERENCE.md](REFERENCE.md) for complete API documentation.
See [WORKFLOWS.md](WORKFLOWS.md) for common workflows.
See [EXAMPLES.md](EXAMPLES.md) for reasoning patterns and examples.

### Issues
- `linear.listIssues(options?)` - List issues with filters
- `linear.getIssue(identifier)` - Get issue by identifier (e.g., 'ENG-123')
- `linear.createIssue(payload)` - Create new issue
- `linear.updateIssue(identifier, payload)` - Update existing issue
- `linear.searchIssues(query, options?)` - Semantic search

### Projects
- `linear.listProjects(options?)` - List projects
- `linear.getProject(name)` - Get project by name
- `linear.getProjectMetrics(name)` - Get project analytics

### Cycles
- `linear.listCycles(options?)` - List sprints/cycles
- `linear.getCycleMetrics(options?)` - Get sprint burndown

### Teams
- `linear.listTeams()` - List all teams

### Users
- `linear.listUsers()` - List all workspace users
- `linear.resolveUser(nameOrEmail)` - Find user by partial name/email

### Utilities
- `linear.preflight()` - Session init: user, org, teams, rate limits
- `linear.parseIdentifier(input)` - Normalize "123", "ENG-123", or URLs
- `linear.filterSuggest(query)` - AI-powered filter suggestions

## Output Format

All functions return typed objects. Use `JSON.stringify()` for formatted output:
```javascript
console.log(JSON.stringify(result, null, 2))
```

## Error Handling

Errors are thrown with helpful messages:
- Missing `.env`: Instructions to create it
- Invalid API key: Link to get new key
- Rate limited: Wait message
