# Linear Skill Examples

## Contents
- [Pattern: User Request -> Reasoning -> Action](#pattern-user-request---reasoning---action) (line 22)
- [Example 1: Show me my tickets](#example-1-show-me-my-tickets) (line 28)
- [Example 2: Create a bug for the login page](#example-2-create-a-bug-for-the-login-page) (line 49)
- [Example 3: Move ENG-456 to done](#example-3-move-eng-456-to-done) (line 84)
- [Example 4: Assign this to Sarah](#example-4-assign-this-to-sarah) (line 113)
- [Example 5: How's the sprint going?](#example-5-hows-the-sprint-going) (line 154)
- [Example 6: Find issues about authentication](#example-6-find-issues-about-authentication) (line 188)
- [Example 7: What labels can I use?](#example-7-what-labels-can-i-use) (line 213)
- [Example 8: Add a comment about the fix](#example-8-add-a-comment-about-the-fix) (line 236)
- [Example 9: What's the status of the Q1 project?](#example-9-whats-the-status-of-the-q1-project) (line 256)
- [Example 10: Complex Request - Triage this URL](#example-10-complex-request---triage-this-url) (line 283)
- [Decision Tree: Which Function to Use?](#decision-tree-which-function-to-use) (line 324)
- [Common Reasoning Patterns](#common-reasoning-patterns) (line 383)

---

Examples showing how to reason about user requests and propose actions.

## Pattern: User Request -> Reasoning -> Action

Each example shows the thinking process for handling Linear-related requests.

---

## Example 1: "Show me my tickets"

**User says:** "Show me my tickets"

**Reasoning:**
1. User wants to see their assigned issues
2. "My" means issues assigned to the current user -> use `assignee: 'me'`
3. "Tickets" typically means active work -> filter by `state: 'active'` to exclude completed/canceled
4. No team specified -> show issues across all teams
5. Use `listIssues` with these filters

**Action:**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const issues = await linear.listIssues({ assignee: 'me', state: 'active' })
  console.log(JSON.stringify(issues, null, 2))
"
```

---

## Example 2: "Create a bug for the login page"

**User says:** "Create a bug for the login page not loading on mobile"

**Reasoning:**
1. User wants to create a new issue
2. It's a bug -> should be treated as high priority unless specified otherwise
3. Need to determine which team handles this
4. First, run `preflight()` to see available teams
5. Ask user which team, OR if context suggests a team (e.g., frontend team for UI bugs), use that
6. Include clear reproduction context in description

**Action (Step 1 - Discover teams):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const info = await linear.preflight()
  console.log('Available teams:', info.teams.map(t => t.key + ' (' + t.name + ')').join(', '))
"
```

**Action (Step 2 - After user confirms team is 'ENG'):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const issue = await linear.createIssue({
    team: 'ENG',
    title: 'Bug: Login page not loading on mobile',
    description: '## Problem\\nThe login page fails to load on mobile devices.\\n\\n## Steps to Reproduce\\n1. Open the app on a mobile device\\n2. Navigate to login page\\n3. Observe the page fails to load\\n\\n## Expected Behavior\\nLogin page should load normally on mobile.',
    priority: 'high'
  })
  console.log('Created:', issue.identifier, issue.url)
"
```

---

## Example 3: "Move ENG-456 to done"

**User says:** "Move ENG-456 to done"

**Reasoning:**
1. User wants to update an issue's state
2. Issue identifier is "ENG-456" -> already in correct format
3. "Done" is the target state, but actual state name varies by team
4. Need to find the exact state name for the ENG team
5. Query team states first, then update with correct state name

**Action (Step 1 - Discover states):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const states = await linear.getTeamStates('ENG')
  console.log('Available states:', states.states.map(s => s.name + ' (' + s.type + ')').join(', '))
"
```

**Action (Step 2 - If "Done" is a valid state name):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const updated = await linear.updateIssue('ENG-456', { state: 'Done' })
  console.log('Updated:', updated.identifier, 'URL:', updated.url)
"
```

---

## Example 4: "Assign this to Sarah"

**User says:** "Assign ENG-789 to Sarah"

**Reasoning:**
1. User wants to assign an issue to a specific person
2. "Sarah" is a partial name -> need to resolve to actual user
3. Use `resolveUser` to find Sarah's user ID
4. Handle case where multiple Sarahs exist (present alternatives)
5. Then update the issue with the resolved user

**Action (Step 1 - Resolve user):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const result = await linear.resolveUser('Sarah')
  if (result.found) {
    console.log('Found:', result.user.name, '(' + result.user.email + ')')
    if (result.alternatives.length > 0) {
      console.log('Other matches:', result.alternatives.map(u => u.name).join(', '))
    }
  } else {
    console.log('No user found matching Sarah')
  }
"
```

**Action (Step 2 - After confirming correct Sarah):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  // Use the raw client to assign by user ID
  const client = linear.getClient()
  const issues = await client.issues({ filter: { identifier: { eq: 'ENG-789' } } })
  if (issues.nodes.length > 0) {
    await client.updateIssue(issues.nodes[0].id, { assigneeId: 'USER_ID_HERE' })
    console.log('Assigned ENG-789 to Sarah')
  }
"
```

---

## Example 5: "How's the sprint going?"

**User says:** "How's the sprint going?"

**Reasoning:**
1. User wants sprint/cycle progress information
2. No team specified -> might need to clarify, OR show all active cycles
3. "Sprint" = "Cycle" in Linear terminology
4. Use `getCycleMetrics` for detailed burndown, or `listCycles` for overview
5. If user has context of a specific team, use that

**Action (Option A - Show active cycle for default team):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const metrics = await linear.getCycleMetrics()
  console.log('Sprint:', metrics.name, '(#' + metrics.number + ')')
  console.log('Progress:', metrics.progress + '%')
  console.log('Status:', metrics.burndownStatus)
  console.log('Team:', metrics.team)
"
```

**Action (Option B - Show all active cycles):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const cycles = await linear.listCycles({ active: true })
  cycles.cycles.forEach(c => {
    console.log(c.team + ': ' + c.name + ' - ' + c.progress + '% complete')
  })
"
```

---

## Example 6: "Find issues about authentication"

**User says:** "Find issues about authentication"

**Reasoning:**
1. User wants to search for issues by keyword
2. This is a semantic search -> use `searchIssues`
3. "Authentication" is the search term
4. No filters specified -> search across all issues
5. Return relevant results with context

**Action:**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const results = await linear.searchIssues('authentication')
  results.issues.forEach(issue => {
    console.log(issue.identifier + ': ' + issue.title)
    console.log('  State: ' + issue.state + ' | Priority: ' + issue.priority)
    console.log('  ' + issue.url)
  })
"
```

---

## Example 7: "What labels can I use?"

**User says:** "What labels can I use for ENG team?"

**Reasoning:**
1. User wants to know available labels for a team
2. Team is specified as "ENG"
3. Use `getTeamLabels` to retrieve all labels
4. Display label names and descriptions to help user choose

**Action:**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const result = await linear.getTeamLabels('ENG')
  console.log('Labels for team ' + result.team + ':')
  result.labels.forEach(l => {
    console.log('  - ' + l.name + (l.description ? ': ' + l.description : ''))
  })
"
```

---

## Example 8: "Add a comment about the fix"

**User says:** "Add a comment to ENG-123 saying the fix is in PR #456"

**Reasoning:**
1. User wants to add a comment to an existing issue
2. Issue identifier is "ENG-123"
3. Comment content is about a PR fix
4. Use `addComment` with the issue identifier and body

**Action:**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const comment = await linear.addComment('ENG-123', 'Fix implemented in PR #456. Ready for review.')
  console.log('Comment added:', comment.url)
"
```

---

## Example 9: "What's the status of the Q1 project?"

**User says:** "What's the status of the Q1 project?"

**Reasoning:**
1. User wants project status information
2. "Q1" is likely part of the project name
3. Use `getProject` for details, or `getProjectMetrics` for analytics
4. Fuzzy matching will find projects containing "Q1"

**Action:**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  const project = await linear.getProject('Q1')
  console.log('Project:', project.name)
  console.log('State:', project.state, '| Health:', project.health || 'Not set')
  console.log('Progress:', project.progress + '%')
  console.log('Target Date:', project.targetDate || 'Not set')
  console.log('\\nIssue Breakdown:')
  Object.entries(project.issueStateBreakdown).forEach(([state, count]) => {
    console.log('  ' + state + ': ' + count)
  })
"
```

---

## Example 10: Complex Request - "Triage this URL"

**User says:** "Can you look at https://linear.app/myorg/issue/ENG-999/login-bug and triage it?"

**Reasoning:**
1. User provided a Linear URL -> extract identifier using `parseIdentifier`
2. "Triage" typically means: review, set priority, possibly assign
3. First, get full issue details to understand the problem
4. Then suggest priority and potentially assign based on content

**Action (Step 1 - Get issue details):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  // parseIdentifier handles URLs automatically
  const id = linear.parseIdentifier('https://linear.app/myorg/issue/ENG-999/login-bug')
  console.log('Extracted identifier:', id)

  const issue = await linear.getIssue(id)
  console.log('Title:', issue.title)
  console.log('Description:', issue.description || '(none)')
  console.log('Current State:', issue.state)
  console.log('Current Priority:', issue.priorityLabel)
  console.log('Assignee:', issue.assignee || 'Unassigned')
  console.log('Labels:', issue.labels.join(', ') || 'None')
"
```

**Action (Step 2 - After reviewing, suggest updates):**
```bash
bun --preload ~/.claude/skills/linear/preload.ts -e "
  // Based on review, update priority and add labels
  const updated = await linear.updateIssue('ENG-999', {
    priority: 'high',
    addLabels: ['bug', 'needs-triage']
  })
  console.log('Triaged:', updated.identifier)
"
```

---

## Decision Tree: Which Function to Use?

```
User Request
    |
    +- "show/list/my" -> Viewing issues
    |   +- Specific issue (has identifier) -> getIssue()
    |   +- My issues -> listIssues({ assignee: 'me' })
    |   +- Team/filtered issues -> listIssues({ team, state, priority })
    |
    +- "create/new/add" -> Creating
    |   +- Issue/ticket/bug -> createIssue()
    |   +- Comment -> addComment()
    |
    +- "update/move/change/assign" -> Modifying
    |   +- Issue -> updateIssue()
    |
    +- "find/search" -> Searching
    |   +- By keywords -> searchIssues()
    |
    +- "project/milestone" -> Project info
    |   +- List projects -> listProjects()
    |   +- Project details -> getProject()
    |   +- Project analytics -> getProjectMetrics()
    |
    +- "sprint/cycle" -> Cycle info
    |   +- List cycles -> listCycles()
    |   +- Cycle metrics -> getCycleMetrics()
    |
    +- "team/who" -> Team/User info
    |   +- List teams -> listTeams()
    |   +- Team states -> getTeamStates()
    |   +- Team labels -> getTeamLabels()
    |   +- List users -> listUsers()
    |   +- Find user -> resolveUser()
    |
    +- URL or unknown format -> parseIdentifier() first
    |
    +- COMPLEX QUERIES -> Use SDK Directly (linear.getClient())
        |
        +- Aggregations/calculations
        |   +- Cycle time, velocity, productivity metrics
        |
        +- Custom filters not in built-in functions
        |   +- Stale issues, date ranges, complex conditions
        |
        +- Bulk operations
        |   +- Update multiple issues, batch changes
        |
        +- Cross-entity queries
        |   +- Compare teams, combine project + cycle data
        |
        +- Custom reports
        |   +- Weekly digest, CSV export, dashboards
        |
        +- Historical analysis
            +- Trend analysis, burndown comparisons
```

## Common Reasoning Patterns

### Pattern: Ambiguous Team
When user doesn't specify team:
1. Check if previous context mentions a team
2. If not, run `preflight()` to show available teams
3. Ask user to clarify, OR default to showing all teams

### Pattern: Partial Identifiers
When user gives incomplete info like "issue 123":
1. Ask which team (e.g., "Is that ENG-123 or PROD-123?")
2. Or use `parseIdentifier('123', 'ENG')` if team is contextually known

### Pattern: State Changes
Before changing state:
1. Always check `getTeamStates(team)` for valid state names
2. State names are team-specific (e.g., "Done" vs "Completed" vs "Closed")
3. Match case-insensitively but use exact name in update

### Pattern: User Assignment
Before assigning to a person:
1. Use `resolveUser(name)` to find the correct user
2. Handle multiple matches by asking user to clarify
3. Handle no matches by listing available users

### Pattern: Discovery First
When uncertain about available options:
1. `preflight()` -> teams, user info, rate limits
2. `getTeamStates(team)` -> workflow states
3. `getTeamLabels(team)` -> available labels
4. `listUsers()` -> all workspace users

### Pattern: When to Use SDK Directly
Use `linear.getClient()` when:
1. User wants aggregated metrics (counts, averages, rankings)
2. Filter criteria aren't available in built-in functions
3. Need to combine data from multiple entity types
4. Bulk operations on many issues at once
5. Custom date range queries (last month, last quarter, etc.)
6. Export/transformation of data (CSV, reports)

### Pattern: Building SDK Queries
When writing SDK queries:
1. Start with `const client = linear.getClient()`
2. Use `client.issues()`, `client.projects()`, `client.cycles()` etc.
3. Build filter objects with operators: `eq`, `in`, `nin`, `lt`, `gt`, `gte`, `lte`, `containsIgnoreCase`
4. Await relations: `const assignee = await issue.assignee`
5. Handle pagination: use `first: N` for limits
6. Check for null values: `assignee?.name || 'Unassigned'`

### Pattern: Safe Bulk Operations
For bulk changes:
1. First query and display what will be affected
2. Ask user to confirm before applying changes
3. Comment out the actual modification code initially
4. Let user uncomment when ready to execute
5. Log each change as it happens
