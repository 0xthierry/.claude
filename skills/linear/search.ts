import { getClient, handleError } from './common.ts'

// ============================================================================
// Types
// ============================================================================

interface SearchResult {
    identifier: string
    title: string
    description: string | null
    priority: string
    state: string | null
    assignee: string | null
    url: string
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Semantic search for issues
 */
export async function searchIssues(
    query: string,
    options: { limit?: number } = {}
): Promise<{
    query: string
    count: number
    issues: SearchResult[]
}> {
    try {
        const client = getClient()

        const results = await client.searchIssues(query, {
            first: options.limit ?? 10
        })

        const output: SearchResult[] = await Promise.all(
            results.nodes.map(async (issue) => {
                const state = await issue.state
                const assignee = await issue.assignee
                return {
                    identifier: issue.identifier,
                    title: issue.title,
                    description: issue.description?.substring(0, 150) ?? null,
                    priority: issue.priorityLabel,
                    state: state?.name ?? null,
                    assignee: assignee?.name ?? null,
                    url: issue.url
                }
            })
        )

        return {
            query,
            count: output.length,
            issues: output
        }
    } catch (error) {
        handleError(error)
    }
}

/**
 * Get AI-powered filter suggestions from natural language
 */
export async function filterSuggest(query: string): Promise<{
    query: string
    suggestedFilter: unknown
}> {
    try {
        const client = getClient()
        const suggestion = await client.issueFilterSuggestion(query)

        return {
            query,
            suggestedFilter: suggestion.filter
        }
    } catch (error) {
        handleError(error)
    }
}
