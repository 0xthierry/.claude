---
name: managing-linear
description: Manage Linear issues, projects, cycles, and team metrics using the Linear SDK. Use when user mentions Linear, issues, tickets, tasks, bugs, sprints, cycles, backlogs, project tracking, milestones, assignments, priorities, estimates, roadmap, velocity, burndown, or when working with URLs containing linear.app.
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

## Common Patterns

### Assigning Issues to Users
Don't guess user IDs - resolve them first:
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const user = await linear.resolveUser('sarah')
  if (user.found) {
    console.log('Found:', user.user.name, user.user.id)
    // Use user.user.id for assignment
  } else {
    console.log('User not found')
  }
"
```

### Changing Issue State
Always check available states for the team first:
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const states = await linear.getTeamStates('ENG')
  console.log('Available states:', states.states.map(s => s.name).join(', '))
  // Then use the exact state name in updateIssue
"
```

### Flexible Identifier Input
The skill accepts multiple formats:
- `ENG-123` - standard format
- `https://linear.app/myorg/issue/ENG-123` - full URL
- `123` - number only (requires team context)

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No .env file found" | Missing API key | Create `.env` with `LINEAR_API_KEY=...` |
| "Authentication failed" | Invalid API key | Get new key at linear.app/settings/api |
| "Team 'X' not found" | Wrong team key | Run `preflight()` to see available teams |
| "State 'X' not found" | Wrong state name | Run `getTeamStates('TEAM')` to see options |
| "User not found" | User doesn't exist | Run `listUsers()` to see all users |

## Need Custom Functionality?

If you need operations not covered by the built-in functions, you can use the Linear SDK directly. See the "Exploring the Linear SDK Types" section in references/api.md for:
- How to access the raw client
- Discovering available methods and types
- Common SDK patterns
- Writing custom functions

## Available Functions

See [references/api.md](references/api.md) for complete API documentation including:
- **Issues**: listIssues, getIssue, createIssue, updateIssue, searchIssues
- **Projects**: listProjects, getProject, getProjectMetrics
- **Cycles**: listCycles, getCycleMetrics
- **Teams/Users**: listTeams, getTeamStates, getTeamLabels, listUsers, resolveUser, resolveTeam
- **Comments**: listComments, addComment
- **Utilities**: preflight, parseIdentifier, filterSuggest

See [references/workflows.md](references/workflows.md) for common workflows.
See [references/examples.md](references/examples.md) for reasoning patterns and examples.

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
