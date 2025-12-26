import * as linear from './index.ts'

declare global {
    var linear: typeof import('./index.ts')
}

globalThis.linear = linear
