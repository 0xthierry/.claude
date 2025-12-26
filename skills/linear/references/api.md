# Linear API Reference

## Contents
- [Authentication](#authentication) (line 20)
- [Priority Levels](#priority-levels) (line 30)
- [Issue States](#issue-states) (line 40)
- [Project Health](#project-health) (line 50)
- [All Functions](#all-functions) (line 56)
  - [Issues](#issues) (line 58)
  - [Projects](#projects) (line 67)
  - [Cycles](#cycles) (line 74)
  - [Teams](#teams) (line 80)
  - [Users](#users) (line 88)
  - [Comments](#comments) (line 94)
  - [Utilities](#utilities) (line 100)
- [Exploring the Linear SDK Types](#exploring-the-linear-sdk-types) (line 109)

---

## Authentication

Store your API key in `.env`:
```bash
LINEAR_API_KEY=lin_api_xxxxx
```

Get your key: https://linear.app/settings/api
Rate limit: 1,500 requests/hour

## Priority Levels

| Value | Name   | Description |
|-------|--------|-------------|
| 0     | none   | No priority |
| 1     | urgent | Critical |
| 2     | high   | Important |
| 3     | medium | Normal (default) |
| 4     | low    | When time permits |

## Issue States

| Type      | Description |
|-----------|-------------|
| backlog   | Not started |
| unstarted | Ready to start |
| started   | In progress |
| completed | Done |
| canceled  | Won't do |

## Project Health

- `onTrack` - Progressing well
- `atRisk` - Some concerns
- `offTrack` - Significant issues

## All Functions

### Issues
| Function | Description |
|----------|-------------|
| `listIssues(options?)` | List with filters |
| `getIssue(identifier)` | Get by ID like 'ENG-123' |
| `createIssue(payload)` | Create new issue |
| `updateIssue(id, payload)` | Update existing |
| `searchIssues(query)` | Semantic search |

### Projects
| Function | Description |
|----------|-------------|
| `listProjects(options?)` | List projects |
| `getProject(name)` | Get by name |
| `getProjectMetrics(name)` | Analytics |

### Cycles
| Function | Description |
|----------|-------------|
| `listCycles(options?)` | List sprints |
| `getCycleMetrics(options?)` | Burndown |

### Teams
| Function | Description |
|----------|-------------|
| `listTeams()` | All teams |
| `getTeamStates(team)` | Workflow states |
| `getTeamLabels(team)` | Available labels |
| `resolveTeam(query)` | Find team by name |

### Users
| Function | Description |
|----------|-------------|
| `listUsers()` | All workspace users |
| `resolveUser(query)` | Find user by name |

### Comments
| Function | Description |
|----------|-------------|
| `listComments(identifier)` | Get issue comments |
| `addComment(identifier, body)` | Add comment |

### Utilities
| Function | Description |
|----------|-------------|
| `preflight()` | Session init |
| `parseIdentifier(input)` | Normalize IDs |
| `filterSuggest(query)` | AI filter |

---

## Exploring the Linear SDK Types

When you need functionality not covered by the skill's built-in functions, you can write custom code using the `@linear/sdk` directly. The SDK is fully typed - here's how to discover available methods and types.

### Accessing the Raw Client

The skill exposes the underlying LinearClient:

```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const client = linear.getClient()
  // Now you can use any SDK method directly
"
```

### Discovering Available Types

**Option 1: Read the type definitions directly**

The SDK types are in `node_modules/@linear/sdk/dist/index.d.ts`. Key sections:

```bash
# View the main LinearClient class and its methods
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const { LinearClient } = await import('@linear/sdk')
  // The client has methods like: issues(), projects(), users(), teams(), etc.
  // Each returns a Connection with .nodes array
"
```

**Option 2: Explore entity types at runtime**

```bash
# Get an issue and explore its properties
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const client = linear.getClient()
  const issues = await client.issues({ first: 1 })
  const issue = issues.nodes[0]

  // Print all available properties
  console.log('Issue properties:', Object.keys(issue))

  // Properties that return Promises are relations:
  // - issue.assignee -> User
  // - issue.team -> Team
  // - issue.project -> Project
  // - issue.state -> WorkflowState
  // - issue.labels() -> IssueLabel[]
  // - issue.comments() -> Comment[]
"
```

### Common SDK Patterns

**Fetching with filters:**
```typescript
const client = linear.getClient()
const issues = await client.issues({
  filter: {
    team: { key: { eq: 'ENG' } },
    state: { type: { nin: ['completed', 'canceled'] } },
    priority: { lte: 2 }  // urgent or high
  },
  first: 50,
  orderBy: 'createdAt'
})
```

**Creating entities:**
```typescript
const result = await client.createIssue({
  teamId: 'team-uuid',
  title: 'Issue title',
  description: 'Markdown description',
  priority: 2,  // high
  assigneeId: 'user-uuid'
})
if (result.success) {
  const issue = await result.issue
  console.log(issue.identifier)
}
```

**Updating entities:**
```typescript
await client.updateIssue('issue-uuid', {
  title: 'New title',
  stateId: 'state-uuid'
})
```

### Key SDK Types

| Type | Description | Key Properties |
|------|-------------|----------------|
| `Issue` | A ticket/task | identifier, title, priority, state, assignee |
| `Project` | A collection of issues | name, progress, health, targetDate |
| `Cycle` | A sprint/iteration | name, number, startsAt, endsAt, progress |
| `Team` | A group of users | key, name, states(), labels() |
| `User` | A workspace member | name, email, displayName |
| `WorkflowState` | Issue state | name, type (backlog/started/completed) |
| `Comment` | Issue comment | body, user, createdAt |

### Relation Navigation

Most properties that reference other entities return Promises:

```typescript
const issue = issues.nodes[0]

// These are async - need await
const assignee = await issue.assignee  // User | null
const team = await issue.team          // Team
const state = await issue.state        // WorkflowState
const project = await issue.project    // Project | null
const creator = await issue.creator    // User | null

// These return Connections (lists)
const labels = await issue.labels()    // { nodes: Label[] }
const comments = await issue.comments({ first: 10 })
```

### Finding Entity IDs

When you need UUIDs for create/update operations:

```typescript
// Find team ID by key
const teams = await client.teams({ filter: { key: { eq: 'ENG' } } })
const teamId = teams.nodes[0].id

// Find user ID by email
const users = await client.users({ filter: { email: { eq: 'john@example.com' } } })
const userId = users.nodes[0].id

// Find state ID by name
const team = teams.nodes[0]
const states = await team.states()
const stateId = states.nodes.find(s => s.name === 'In Progress')?.id
```

### Writing Custom Functions

Example: Archive all completed issues older than 30 days

```typescript
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const client = linear.getClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const issues = await client.issues({
    filter: {
      state: { type: { eq: 'completed' } },
      completedAt: { lt: thirtyDaysAgo.toISOString() }
    },
    first: 100
  })

  console.log('Found', issues.nodes.length, 'issues to archive')

  for (const issue of issues.nodes) {
    await client.archiveIssue(issue.id)
    console.log('Archived:', issue.identifier)
  }
"
```

### SDK Documentation

- **NPM Package**: https://www.npmjs.com/package/@linear/sdk
- **Linear API Docs**: https://developers.linear.app/docs/graphql/working-with-the-graphql-api
- **GraphQL Schema**: The SDK wraps the GraphQL API - same entities and filters
