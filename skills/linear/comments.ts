import { getClient, handleError, parseIdentifier } from './common.ts'

// ============================================================================
// Types
// ============================================================================

interface CommentOutput {
    id: string
    body: string
    createdAt: string
    updatedAt: string
    user: string | null
    url: string
}

// ============================================================================
// Functions
// ============================================================================

/**
 * List comments on an issue
 */
export async function listComments(
    identifier: string,
    options: { limit?: number } = {}
): Promise<{
    issue: string
    count: number
    comments: CommentOutput[]
}> {
    try {
        const client = getClient()
        const normalizedId = parseIdentifier(identifier)

        // Search for the issue by identifier
        const searchResults = await client.searchIssues(normalizedId, { first: 10 })
        const searchResult = searchResults.nodes.find(i => i.identifier === normalizedId)

        if (!searchResult) {
            throw new Error(`Issue '${normalizedId}' not found`)
        }

        const issue = await client.issue(searchResult.id)
        const comments = await issue.comments({ first: options.limit ?? 20 })

        return {
            issue: issue.identifier,
            count: comments.nodes.length,
            comments: await Promise.all(
                comments.nodes.map(async (c) => {
                    const user = await c.user
                    return {
                        id: c.id,
                        body: c.body,
                        createdAt: c.createdAt.toISOString(),
                        updatedAt: c.updatedAt.toISOString(),
                        user: user?.name ?? null,
                        url: c.url
                    }
                })
            )
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Add a comment to an issue
 */
export async function addComment(
    identifier: string,
    body: string
): Promise<{
    id: string
    issue: string
    url: string
}> {
    try {
        const client = getClient()
        const normalizedId = parseIdentifier(identifier)

        // Search for the issue by identifier
        const searchResults = await client.searchIssues(normalizedId, { first: 10 })
        const searchResult = searchResults.nodes.find(i => i.identifier === normalizedId)

        if (!searchResult) {
            throw new Error(`Issue '${normalizedId}' not found`)
        }

        const issue = await client.issue(searchResult.id)
        const result = await client.createComment({
            issueId: issue.id,
            body
        })

        if (!result.success) {
            throw new Error('Failed to create comment')
        }

        const comment = await result.comment
        if (!comment) {
            throw new Error('Comment created but could not be fetched')
        }

        return {
            id: comment.id,
            issue: issue.identifier,
            url: comment.url
        }
    } catch (error) {
        handleError(error)
    }
}
