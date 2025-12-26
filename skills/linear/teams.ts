import { getClient, handleError } from './common.ts'

// ============================================================================
// Types
// ============================================================================

interface TeamOutput {
    id: string
    key: string
    name: string
    description: string | null
    issueCount: number
    activeCycle: {
        name: string
        number: number
        progress: number
    } | null
}

interface TeamStateOutput {
    id: string
    name: string
    type: string
    color: string
    position: number
}

interface TeamLabelOutput {
    id: string
    name: string
    color: string
    description: string | null
}

// ============================================================================
// Functions
// ============================================================================

/**
 * List all accessible teams
 */
export async function listTeams(): Promise<{
    count: number
    teams: TeamOutput[]
}> {
    try {
        const client = getClient()
        const teams = await client.teams()

        const output: TeamOutput[] = await Promise.all(
            teams.nodes.map(async (team) => {
                const activeCycle = await team.activeCycle
                return {
                    id: team.id,
                    key: team.key,
                    name: team.name,
                    description: team.description?.substring(0, 100) ?? null,
                    issueCount: team.issueCount,
                    activeCycle: activeCycle ? {
                        name: activeCycle.name,
                        number: activeCycle.number,
                        progress: Math.round((activeCycle.progress ?? 0) * 100)
                    } : null
                }
            })
        )

        return { count: output.length, teams: output }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Get available workflow states for a team
 * Use this to discover valid state names before updating issues
 */
export async function getTeamStates(teamKey: string): Promise<{
    team: string
    states: TeamStateOutput[]
}> {
    try {
        const client = getClient()
        const teams = await client.teams({
            filter: { key: { eq: teamKey.toUpperCase() } }
        })

        if (teams.nodes.length === 0) {
            const allTeams = await client.teams()
            const available = allTeams.nodes.map(t => t.key).join(', ')
            throw new Error(`Team '${teamKey}' not found. Available teams: ${available}`)
        }

        const team = teams.nodes[0]
        const states = await team.states()

        return {
            team: team.key,
            states: states.nodes.map(s => ({
                id: s.id,
                name: s.name,
                type: s.type,
                color: s.color,
                position: s.position
            })).sort((a, b) => a.position - b.position)
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Get available labels for a team
 */
export async function getTeamLabels(teamKey: string): Promise<{
    team: string
    labels: TeamLabelOutput[]
}> {
    try {
        const client = getClient()
        const teams = await client.teams({
            filter: { key: { eq: teamKey.toUpperCase() } }
        })

        if (teams.nodes.length === 0) {
            throw new Error(`Team '${teamKey}' not found`)
        }

        const team = teams.nodes[0]
        const labels = await team.labels()

        return {
            team: team.key,
            labels: labels.nodes.map(l => ({
                id: l.id,
                name: l.name,
                color: l.color,
                description: l.description?.substring(0, 100) ?? null
            }))
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Resolve team by name or key (fuzzy match)
 */
export async function resolveTeam(nameOrKey: string): Promise<TeamOutput | null> {
    try {
        const client = getClient()
        const teams = await client.teams()

        // Exact key match first
        const exactKey = teams.nodes.find(
            t => t.key.toLowerCase() === nameOrKey.toLowerCase()
        )
        if (exactKey) {
            const activeCycle = await exactKey.activeCycle
            return {
                id: exactKey.id,
                key: exactKey.key,
                name: exactKey.name,
                description: exactKey.description?.substring(0, 100) ?? null,
                issueCount: exactKey.issueCount,
                activeCycle: activeCycle ? {
                    name: activeCycle.name,
                    number: activeCycle.number,
                    progress: Math.round((activeCycle.progress ?? 0) * 100)
                } : null
            }
        }

        // Fuzzy name match
        const fuzzyName = teams.nodes.find(
            t => t.name.toLowerCase().includes(nameOrKey.toLowerCase())
        )
        if (fuzzyName) {
            const activeCycle = await fuzzyName.activeCycle
            return {
                id: fuzzyName.id,
                key: fuzzyName.key,
                name: fuzzyName.name,
                description: fuzzyName.description?.substring(0, 100) ?? null,
                issueCount: fuzzyName.issueCount,
                activeCycle: activeCycle ? {
                    name: activeCycle.name,
                    number: activeCycle.number,
                    progress: Math.round((activeCycle.progress ?? 0) * 100)
                } : null
            }
        }

        return null
    } catch (error) {
        handleError(error)
    }
}
