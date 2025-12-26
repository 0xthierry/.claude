import { LinearClient, LinearError, LinearErrorType } from '@linear/sdk'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_PATH = join(__dirname, '.env')

/**
 * Load API key from .env file in skill directory
 */
export function loadApiKey(): string {
    if (!existsSync(ENV_PATH)) {
        throw new Error(
            `No .env file found at ${ENV_PATH}\n` +
            `Create it with: LINEAR_API_KEY=lin_api_xxxxx\n` +
            `Get your key at: https://linear.app/settings/api`
        )
    }

    const content = readFileSync(ENV_PATH, 'utf-8')
    const match = content.match(/^LINEAR_API_KEY=(.+)$/m)

    if (!match || !match[1]) {
        throw new Error(
            `LINEAR_API_KEY not found in ${ENV_PATH}\n` +
            `Add: LINEAR_API_KEY=lin_api_xxxxx`
        )
    }

    return match[1].trim()
}

let _client: LinearClient | null = null

/**
 * Get or create LinearClient instance (singleton)
 */
export function getClient(): LinearClient {
    if (!_client) {
        const apiKey = loadApiKey()
        _client = new LinearClient({ apiKey })
    }
    return _client
}

/**
 * Priority mapping
 */
export const PRIORITY = {
    none: 0,
    urgent: 1,
    high: 2,
    medium: 3,
    normal: 3,
    low: 4
} as const

export type PriorityName = keyof typeof PRIORITY

/**
 * Convert priority name to number
 */
export function priorityToNumber(priority: string): number {
    return PRIORITY[priority.toLowerCase() as PriorityName] ?? 3
}

/**
 * Handle Linear errors with helpful messages
 */
export function handleError(error: unknown): never {
    if (error instanceof LinearError) {
        if (error.type === LinearErrorType.AuthenticationError) {
            throw new Error(`Authentication failed. Check your LINEAR_API_KEY in .env\nGet a new key at: https://linear.app/settings/api`)
        }
        if (error.type === LinearErrorType.Ratelimited) {
            throw new Error(`Rate limited. Wait a moment and try again.`)
        }
        throw new Error(`Linear API error: ${error.message}`)
    }
    throw error
}

/**
 * Parse flexible identifier formats into normalized "TEAM-123" format
 * Handles: "123", "ENG-123", "https://linear.app/org/issue/ENG-123"
 */
export function parseIdentifier(input: string, defaultTeam?: string): string {
    // Already in TEAM-123 format
    if (/^[A-Z]+-\d+$/i.test(input)) {
        return input.toUpperCase()
    }

    // Just a number - requires defaultTeam
    if (/^\d+$/.test(input)) {
        if (!defaultTeam) {
            throw new Error(`Identifier '${input}' is just a number. Provide full identifier like 'ENG-${input}' or specify a default team.`)
        }
        return `${defaultTeam.toUpperCase()}-${input}`
    }

    // URL format: https://linear.app/org/issue/ENG-123 or https://linear.app/org/issue/ENG-123/slug
    const urlMatch = input.match(/linear\.app\/[^/]+\/issue\/([A-Z]+-\d+)/i)
    if (urlMatch) {
        return urlMatch[1].toUpperCase()
    }

    throw new Error(`Cannot parse identifier '${input}'. Use format: 'ENG-123' or full Linear URL.`)
}
