import { getClient, handleError } from './common.ts'

// ============================================================================
// Types
// ============================================================================

interface UserOutput {
    id: string
    name: string
    displayName: string
    email: string
    active: boolean
    admin: boolean
}

// ============================================================================
// Functions
// ============================================================================

/**
 * List all users in the workspace
 */
export async function listUsers(): Promise<{
    count: number
    users: UserOutput[]
}> {
    try {
        const client = getClient()
        const users = await client.users()

        return {
            count: users.nodes.length,
            users: users.nodes.map(u => ({
                id: u.id,
                name: u.name,
                displayName: u.displayName,
                email: u.email,
                active: u.active,
                admin: u.admin
            }))
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Resolve user by partial name or email
 * Use this when user says "assign to John" to find the right user
 */
export async function resolveUser(query: string): Promise<{
    found: boolean
    user: UserOutput | null
    alternatives: UserOutput[]
}> {
    try {
        const client = getClient()
        const users = await client.users()
        const queryLower = query.toLowerCase()

        // Find all matching users
        const matches = users.nodes.filter(u =>
            u.name.toLowerCase().includes(queryLower) ||
            u.displayName.toLowerCase().includes(queryLower) ||
            u.email.toLowerCase().includes(queryLower)
        )

        if (matches.length === 0) {
            return { found: false, user: null, alternatives: [] }
        }

        if (matches.length === 1) {
            const u = matches[0]
            return {
                found: true,
                user: {
                    id: u.id,
                    name: u.name,
                    displayName: u.displayName,
                    email: u.email,
                    active: u.active,
                    admin: u.admin
                },
                alternatives: []
            }
        }

        // Multiple matches - return first as primary, rest as alternatives
        return {
            found: true,
            user: {
                id: matches[0].id,
                name: matches[0].name,
                displayName: matches[0].displayName,
                email: matches[0].email,
                active: matches[0].active,
                admin: matches[0].admin
            },
            alternatives: matches.slice(1, 4).map(u => ({
                id: u.id,
                name: u.name,
                displayName: u.displayName,
                email: u.email,
                active: u.active,
                admin: u.admin
            }))
        }
    } catch (error) {
        handleError(error)
    }
}
