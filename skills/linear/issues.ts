import { getClient, priorityToNumber, handleError } from './common.ts'

// ============================================================================
// Types
// ============================================================================

export interface IssueFilters {
    assignee?: 'me' | string
    team?: string
    state?: 'active' | 'backlog' | 'completed' | string
    priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none'
    project?: string
    limit?: number
}

export interface IssueOutput {
    id: string
    identifier: string
    title: string
    description: string | null
    priority: number
    priorityLabel: string
    state: string
    stateType: string | null
    assignee: string | null
    project: string | null
    team: string | null
    url: string
    createdAt: string
    updatedAt: string
}

export interface IssueDetail extends IssueOutput {
    estimate: number | null
    labels: string[]
    cycle: { name: string; number: number } | null
    creator: string | null
    completedAt: string | null
    recentComments: Array<{ body: string; createdAt: string }>
}

export interface CreateIssuePayload {
    team: string
    title: string
    description?: string
    priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none'
    assignee?: 'me' | string
    project?: string
    estimate?: number
    labels?: string[]
}

export interface UpdateIssuePayload {
    title?: string
    description?: string
    priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none'
    state?: string
    assignee?: 'me' | 'none' | string
}

// ============================================================================
// Functions
// ============================================================================

/**
 * List issues with optional filters
 */
export async function listIssues(options: IssueFilters = {}): Promise<{
    count: number
    hasMore: boolean
    issues: IssueOutput[]
}> {
    try {
        const client = getClient()
        const filter: Record<string, unknown> = {}

        // Assignee filter
        if (options.assignee === 'me') {
            const viewer = await client.viewer
            filter.assignee = { id: { eq: viewer.id } }
        } else if (options.assignee) {
            filter.assignee = { name: { containsIgnoreCase: options.assignee } }
        }

        // Team filter
        if (options.team) {
            filter.team = { key: { eq: options.team.toUpperCase() } }
        }

        // State filter
        if (options.state === 'active') {
            filter.state = { type: { nin: ['completed', 'canceled'] } }
        } else if (options.state === 'backlog') {
            filter.state = { type: { eq: 'backlog' } }
        } else if (options.state === 'completed') {
            filter.state = { type: { eq: 'completed' } }
        } else if (options.state) {
            filter.state = { name: { containsIgnoreCase: options.state } }
        }

        // Priority filter
        if (options.priority) {
            filter.priority = { eq: priorityToNumber(options.priority) }
        }

        // Project filter
        if (options.project) {
            const projects = await client.projects({
                filter: { name: { containsIgnoreCase: options.project } }
            })
            if (projects.nodes.length > 0) {
                filter.project = { id: { eq: projects.nodes[0].id } }
            }
        }

        const issues = await client.issues({
            filter,
            first: options.limit ?? 25
        })

        const output: IssueOutput[] = await Promise.all(
            issues.nodes.map(async (issue) => {
                const state = await issue.state
                const assignee = await issue.assignee
                const project = await issue.project
                const team = await issue.team
                return {
                    id: issue.id,
                    identifier: issue.identifier,
                    title: issue.title,
                    description: issue.description,
                    priority: issue.priority,
                    priorityLabel: issue.priorityLabel,
                    state: state?.name ?? 'Unknown',
                    stateType: state?.type ?? null,
                    assignee: assignee?.name ?? null,
                    project: project?.name ?? null,
                    team: team?.key ?? null,
                    url: issue.url,
                    createdAt: issue.createdAt.toISOString(),
                    updatedAt: issue.updatedAt.toISOString()
                }
            })
        )

        return {
            count: output.length,
            hasMore: issues.pageInfo.hasNextPage,
            issues: output
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Get a single issue by identifier (e.g., 'ENG-123')
 */
export async function getIssue(identifier: string): Promise<IssueDetail> {
    try {
        const client = getClient()
        const normalizedId = identifier.toUpperCase()

        // Search for the issue by identifier (SDK doesn't support direct identifier filter)
        const searchResults = await client.searchIssues(normalizedId, { first: 10 })

        // Find exact match
        const searchResult = searchResults.nodes.find(i => i.identifier === normalizedId)

        if (!searchResult) {
            throw new Error(`Issue '${identifier}' not found`)
        }

        // Fetch full issue object with all relations
        const issue = await client.issue(searchResult.id)
        const state = await issue.state
        const assignee = await issue.assignee
        const project = await issue.project
        const team = await issue.team
        const creator = await issue.creator
        const cycle = await issue.cycle
        const labels = await issue.labels()
        const comments = await issue.comments({ first: 5 })

        return {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            description: issue.description,
            priority: issue.priority,
            priorityLabel: issue.priorityLabel,
            estimate: issue.estimate,
            state: state?.name ?? 'Unknown',
            stateType: state?.type ?? null,
            assignee: assignee?.name ?? null,
            creator: creator?.name ?? null,
            project: project?.name ?? null,
            team: team?.key ?? null,
            cycle: cycle ? { name: cycle.name, number: cycle.number } : null,
            labels: labels.nodes.map(l => l.name),
            url: issue.url,
            createdAt: issue.createdAt.toISOString(),
            updatedAt: issue.updatedAt.toISOString(),
            completedAt: issue.completedAt?.toISOString() ?? null,
            recentComments: comments.nodes.map(c => ({
                body: c.body.substring(0, 200),
                createdAt: c.createdAt.toISOString()
            }))
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Create a new issue
 */
export async function createIssue(payload: CreateIssuePayload): Promise<{
    id: string
    identifier: string
    title: string
    url: string
}> {
    try {
        const client = getClient()

        // Find team by key
        const teams = await client.teams({
            filter: { key: { eq: payload.team.toUpperCase() } }
        })
        if (teams.nodes.length === 0) {
            throw new Error(`Team '${payload.team}' not found. Use team key like 'ENG', 'PROD', etc.`)
        }
        const teamId = teams.nodes[0].id

        // Build input
        const input: Record<string, unknown> = {
            teamId,
            title: payload.title
        }

        if (payload.description) {
            input.description = payload.description
        }

        if (payload.priority) {
            input.priority = priorityToNumber(payload.priority)
        }

        if (payload.assignee === 'me') {
            const viewer = await client.viewer
            input.assigneeId = viewer.id
        }

        if (payload.estimate) {
            input.estimate = payload.estimate
        }

        // Find project if specified
        if (payload.project) {
            const projects = await client.projects({
                filter: { name: { containsIgnoreCase: payload.project } }
            })
            if (projects.nodes.length > 0) {
                input.projectId = projects.nodes[0].id
            }
        }

        const result = await client.createIssue(input)

        if (!result.success) {
            throw new Error('Failed to create issue')
        }

        const issue = await result.issue
        if (!issue) {
            throw new Error('Issue created but could not be fetched')
        }

        return {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            url: issue.url
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Update an existing issue
 */
export async function updateIssue(
    identifier: string,
    payload: UpdateIssuePayload
): Promise<{ id: string; identifier: string; title: string; url: string }> {
    try {
        const client = getClient()
        const normalizedId = identifier.toUpperCase()

        // Search for the issue by identifier (SDK doesn't support direct identifier filter)
        const searchResults = await client.searchIssues(normalizedId, { first: 10 })
        const searchResult = searchResults.nodes.find(i => i.identifier === normalizedId)

        if (!searchResult) {
            throw new Error(`Issue '${identifier}' not found`)
        }

        // Fetch full issue object with relations
        const issue = await client.issue(searchResult.id)
        const input: Record<string, unknown> = {}

        if (payload.title) {
            input.title = payload.title
        }

        if (payload.description) {
            input.description = payload.description
        }

        if (payload.priority) {
            input.priority = priorityToNumber(payload.priority)
        }

        if (payload.state) {
            const team = await issue.team
            if (team) {
                const states = await team.states()
                const targetState = states.nodes.find(
                    s => s.name.toLowerCase() === payload.state?.toLowerCase()
                )
                if (targetState) {
                    input.stateId = targetState.id
                }
            }
        }

        if (payload.assignee === 'me') {
            const viewer = await client.viewer
            input.assigneeId = viewer.id
        } else if (payload.assignee === 'none') {
            input.assigneeId = null
        }

        if (Object.keys(input).length === 0) {
            throw new Error('No updates specified')
        }

        await client.updateIssue(issue.id, input)

        // Fetch updated issue
        const updated = await client.issue(issue.id)

        return {
            id: updated.id,
            identifier: updated.identifier,
            title: updated.title,
            url: updated.url
        }
    } catch (error) {
        handleError(error)
    }
}
