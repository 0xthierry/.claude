// Re-export all functions from domain modules
export { getClient, loadApiKey, PRIORITY, priorityToNumber, parseIdentifier } from './common.ts'
export {
    listIssues,
    getIssue,
    createIssue,
    updateIssue,
    type IssueFilters,
    type IssueOutput,
    type IssueDetail,
    type CreateIssuePayload,
    type UpdateIssuePayload
} from './issues.ts'

// Will add more exports as we implement each module:
// export { listProjects, getProject, getProjectMetrics } from './projects.ts'
// etc.

import { getClient } from './common.ts'

/**
 * Preflight check - validates auth and returns everything Claude needs to start a session
 * Call this first to understand the workspace context
 */
export async function preflight(): Promise<{
    success: boolean
    user: { id: string; name: string; email: string }
    organization: { id: string; name: string; urlKey: string }
    teams: Array<{ id: string; key: string; name: string }>
    rateLimit: { requestsRemaining: number }
}> {
    const client = getClient()
    const viewer = await client.viewer
    const org = await client.organization
    const rateLimit = await client.rateLimitStatus
    const teams = await client.teams()

    return {
        success: true,
        user: {
            id: viewer.id,
            name: viewer.name,
            email: viewer.email
        },
        organization: {
            id: org.id,
            name: org.name,
            urlKey: org.urlKey
        },
        teams: teams.nodes.map(t => ({
            id: t.id,
            key: t.key,
            name: t.name
        })),
        rateLimit: {
            requestsRemaining: rateLimit.limits?.[0]?.remainingAmount ?? 0
        }
    }
}
