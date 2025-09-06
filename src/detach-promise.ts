import { throwIfNotAbort } from './abort-error'
import { IN_VITEST } from './env'

export enum Reason {
    /**
     * Daemon represents a background task Promise that never resolves, such as collaborative long-lived connection channels
     */
    Daemon = 'daemon',

    /**
     * Promises returned by async functions used as DOM Event Callbacks are meaningless to the DOM, such as onScroll, onClick event callbacks
     * React render completion is also considered a DOM Event, so it's also used in onRef
     */
    DomCallback = 'dom_callback',

    /**
     * A project should only have one main function that needs to use ENTRANCE to mark floating promises, like:
     * ```typescript
     * async function main() {
     *     ...
     * }
     *
     * detach(main(), Reason.ENTRANCE)
     * ```
     */
    Entrance = 'entrance',

    /**
     * Deferred represents a Promise that is a delayed execution task
     * When creating a Deferred, it's uncertain whether this Promise will be used
     * So for Deferred that may be rejected, it needs to be collected at creation time
     */
    Deferred = 'deferred',
}

const collectedPromise = new Set<Promise<unknown>>()
const promiseReason = new Map<Promise<unknown>, Reason>()
const promiseDescription = new Map<Promise<unknown>, string>()

export function detach<T>(
    promise: T | Promise<T>,
    reason: Reason,
    description?: string
): void {
    // eslint-disable-next-line no-console
    console.debug('Detach promise', reason, description)

    const isPromise = promise instanceof Promise
    let silencePromise
    if (isPromise) {
        silencePromise = (async () => {
            try {
                await promise
            } catch (error) {
                throwIfNotAbort(error)
            }
        })()
    }

    if (IN_VITEST && silencePromise) {
        collectedPromise.add(silencePromise)
        promiseReason.set(silencePromise, reason)
        if (description) {
            promiseDescription.set(silencePromise, description)
        }
    }
}

export async function clearAllDetached() {
    if (!IN_VITEST) {
        collectedPromise.clear()
        promiseReason.clear()
        promiseDescription.clear()

        return []
    }

    // eslint-disable-next-line no-console
    console.debug('Clear all detached promises')

    const settledResult = []

    // eslint-disable-next-line no-console
    console.group('Detached promises')
    for (const promise of collectedPromise) {
        const reason = promiseReason.get(promise)
        const description = promiseDescription.get(promise)
        // eslint-disable-next-line no-console
        console.debug(
            `Await promise: ${reason ?? 'unknown'} ${description ?? ''}`
        )
        try {
            const result = await promise
            settledResult.push({
                promise,
                reason,
                description: promiseDescription.get(promise),
                result,
            })
        } catch (error) {
            throwIfNotAbort(error)
            settledResult.push({
                promise,
                reason,
                description: promiseDescription.get(promise),
                error,
            })
        }
    }
    // eslint-disable-next-line no-console
    console.groupEnd()

    collectedPromise.clear()
    promiseReason.clear()
    promiseDescription.clear()

    return settledResult
}
