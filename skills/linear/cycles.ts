import { getClient, handleError } from './common.ts'

// ============================================================================
// Types
// ============================================================================

interface CycleFilters {
    team?: string
    active?: boolean
    limit?: number
}

interface CycleOutput {
    id: string
    name: string
    number: number
    team: string | null
    isActive: boolean
    progress: number
    startsAt: string | null
    endsAt: string | null
}

interface CycleMetrics {
    name: string
    number: number
    team: string | null
    isActive: boolean
    progress: number
    startsAt: string | null
    endsAt: string | null
    completedIssueCountHistory: number[] | null
    completedScopeHistory: number[] | null
    inProgressScopeHistory: number[] | null
    scopeHistory: number[] | null
    burndownStatus: string
}

// ============================================================================
// Functions
// ============================================================================

/**
 * List cycles/sprints
 */
export async function listCycles(options: CycleFilters = {}): Promise<{
    count: number
    cycles: CycleOutput[]
}> {
    try {
        const client = getClient()
        const filter: Record<string, unknown> = {}

        if (options.team) {
            filter.team = { key: { eq: options.team.toUpperCase() } }
        }

        if (options.active) {
            filter.isActive = { eq: true }
        }

        const cycles = await client.cycles({
            filter,
            first: options.limit ?? 10
        })

        const output: CycleOutput[] = await Promise.all(
            cycles.nodes.map(async (cycle) => {
                const team = await cycle.team
                return {
                    id: cycle.id,
                    name: cycle.name,
                    number: cycle.number,
                    team: team?.key ?? null,
                    isActive: cycle.isActive,
                    progress: Math.round((cycle.progress ?? 0) * 100),
                    startsAt: cycle.startsAt?.toISOString() ?? null,
                    endsAt: cycle.endsAt?.toISOString() ?? null
                }
            })
        )

        return { count: output.length, cycles: output }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Get cycle/sprint metrics (defaults to active cycle)
 */
export async function getCycleMetrics(options: { team?: string } = {}): Promise<CycleMetrics> {
    try {
        const client = getClient()
        let cycle

        if (options.team) {
            const teams = await client.teams({
                filter: { key: { eq: options.team.toUpperCase() } }
            })
            if (teams.nodes.length === 0) {
                throw new Error(`Team '${options.team}' not found`)
            }
            const activeCycle = await teams.nodes[0].activeCycle
            if (!activeCycle) {
                throw new Error(`No active cycle for team '${options.team}'`)
            }
            cycle = activeCycle
        } else {
            const cycles = await client.cycles({
                filter: { isActive: { eq: true } },
                first: 1
            })
            if (cycles.nodes.length === 0) {
                throw new Error('No active cycles found')
            }
            cycle = cycles.nodes[0]
        }

        const team = await cycle.team

        return {
            name: cycle.name,
            number: cycle.number,
            team: team?.key ?? null,
            isActive: cycle.isActive,
            progress: Math.round((cycle.progress ?? 0) * 100),
            startsAt: cycle.startsAt?.toISOString() ?? null,
            endsAt: cycle.endsAt?.toISOString() ?? null,
            completedIssueCountHistory: cycle.completedIssueCountHistory as number[] | null,
            completedScopeHistory: cycle.completedScopeHistory as number[] | null,
            inProgressScopeHistory: cycle.inProgressScopeHistory as number[] | null,
            scopeHistory: cycle.scopeHistory as number[] | null,
            burndownStatus: analyzeBurndown(
                cycle.scopeHistory as number[] | null,
                cycle.completedScopeHistory as number[] | null,
                cycle.startsAt,
                cycle.endsAt
            )
        }
    } catch (error) {
        handleError(error)
    }
}

function analyzeBurndown(
    scope: number[] | null,
    completed: number[] | null,
    startsAt: Date | undefined,
    endsAt: Date | undefined
): string {
    if (!scope || !completed || scope.length === 0) return 'insufficient data'

    const totalScope = scope[scope.length - 1]
    const totalCompleted = completed[completed.length - 1]
    const percentComplete = totalCompleted / totalScope

    if (!startsAt || !endsAt) return `${Math.round(percentComplete * 100)}% complete`

    const now = new Date()
    const totalDays = (endsAt.getTime() - startsAt.getTime()) / (1000 * 60 * 60 * 24)
    const elapsedDays = (now.getTime() - startsAt.getTime()) / (1000 * 60 * 60 * 24)
    const expectedProgress = elapsedDays / totalDays

    if (percentComplete > expectedProgress + 0.1) return 'ahead of schedule'
    if (percentComplete < expectedProgress - 0.1) return 'behind schedule'
    return 'on track'
}
