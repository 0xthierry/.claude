import { getClient, handleError } from './common.ts'

// ============================================================================
// Types
// ============================================================================

interface ProjectFilters {
    status?: 'active' | 'completed' | 'all'
    team?: string
    limit?: number
}

interface ProjectOutput {
    id: string
    name: string
    description: string | null
    state: string
    progress: number
    health: string | null
    targetDate: string | null
    startDate: string | null
    teams: string[]
    lead: string | null
    url: string
}

interface ProjectDetail extends ProjectOutput {
    milestones: Array<{ name: string; targetDate: string | null; description: string | null }>
    recentUpdates: Array<{ body: string; health: string | null; createdAt: string }>
    issueStateBreakdown: Record<string, number>
}

interface ProjectMetrics {
    name: string
    state: string
    health: string | null
    progress: number
    completedIssueCountHistory: number[] | null
    completedScopeHistory: number[] | null
    inProgressScopeHistory: number[] | null
    scopeHistory: number[] | null
    trend: 'improving' | 'stable' | 'declining' | 'insufficient data'
    velocity: number | null
}

// ============================================================================
// Functions
// ============================================================================

/**
 * List projects
 */
export async function listProjects(options: ProjectFilters = {}): Promise<{
    count: number
    projects: ProjectOutput[]
}> {
    try {
        const client = getClient()
        const filter: Record<string, unknown> = {}

        if (options.status === 'active' || !options.status) {
            filter.state = { in: ['planned', 'started'] }
        } else if (options.status === 'completed') {
            filter.state = { eq: 'completed' }
        }
        // 'all' = no filter

        const projects = await client.projects({
            filter,
            first: options.limit ?? 20
        })

        const output: ProjectOutput[] = await Promise.all(
            projects.nodes.map(async (project) => {
                const teams = await project.teams()
                const lead = await project.lead
                return {
                    id: project.id,
                    name: project.name,
                    description: project.description?.substring(0, 200) ?? null,
                    state: project.state,
                    progress: Math.round((project.progress ?? 0) * 100),
                    health: project.health,
                    targetDate: project.targetDate,
                    startDate: project.startDate,
                    teams: teams.nodes.map(t => t.key),
                    lead: lead?.name ?? null,
                    url: project.url
                }
            })
        )

        return { count: output.length, projects: output }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Get project details by name
 */
export async function getProject(name: string): Promise<ProjectDetail> {
    try {
        const client = getClient()

        const projects = await client.projects({
            filter: { name: { containsIgnoreCase: name } }
        })

        if (projects.nodes.length === 0) {
            throw new Error(`Project matching '${name}' not found`)
        }

        const project = projects.nodes[0]
        const teams = await project.teams()
        const lead = await project.lead
        const milestones = await project.projectMilestones()
        const updates = await project.projectUpdates({ first: 3 })
        const issues = await project.issues({ first: 50 })

        // Get issue state breakdown
        const stateBreakdown: Record<string, number> = {}
        for (const issue of issues.nodes) {
            const state = await issue.state
            const stateName = state?.name ?? 'Unknown'
            stateBreakdown[stateName] = (stateBreakdown[stateName] || 0) + 1
        }

        return {
            id: project.id,
            name: project.name,
            description: project.description,
            state: project.state,
            progress: Math.round((project.progress ?? 0) * 100),
            health: project.health,
            startDate: project.startDate,
            targetDate: project.targetDate,
            teams: teams.nodes.map(t => t.key),
            lead: lead?.name ?? null,
            url: project.url,
            milestones: milestones.nodes.map(m => ({
                name: m.name,
                targetDate: m.targetDate,
                description: m.description?.substring(0, 100) ?? null
            })),
            recentUpdates: updates.nodes.map(u => ({
                body: u.body.substring(0, 300),
                health: u.health,
                createdAt: u.createdAt.toISOString()
            })),
            issueStateBreakdown: stateBreakdown
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Get project metrics and analytics
 */
export async function getProjectMetrics(name: string): Promise<ProjectMetrics> {
    try {
        const client = getClient()

        const projects = await client.projects({
            filter: { name: { containsIgnoreCase: name } }
        })

        if (projects.nodes.length === 0) {
            throw new Error(`Project matching '${name}' not found`)
        }

        const project = projects.nodes[0]

        return {
            name: project.name,
            state: project.state,
            health: project.health,
            progress: Math.round((project.progress ?? 0) * 100),
            completedIssueCountHistory: project.completedIssueCountHistory as number[] | null,
            completedScopeHistory: project.completedScopeHistory as number[] | null,
            inProgressScopeHistory: project.inProgressScopeHistory as number[] | null,
            scopeHistory: project.scopeHistory as number[] | null,
            trend: analyzeTrend(project.completedScopeHistory as number[] | null),
            velocity: calculateVelocity(project.completedScopeHistory as number[] | null)
        }
    } catch (error) {
        handleError(error)
    }
}

function analyzeTrend(history: number[] | null): 'improving' | 'stable' | 'declining' | 'insufficient data' {
    if (!history || history.length < 3) return 'insufficient data'
    const recent = history.slice(-3)
    const older = history.slice(-6, -3)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.length ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg
    if (recentAvg > olderAvg * 1.1) return 'improving'
    if (recentAvg < olderAvg * 0.9) return 'declining'
    return 'stable'
}

function calculateVelocity(history: number[] | null): number | null {
    if (!history || history.length < 2) return null
    const recent = history.slice(-4)
    return Math.round(recent.reduce((a, b) => a + b, 0) / recent.length)
}
