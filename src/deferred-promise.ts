import { detach, Reason } from './detach-promise'

export interface DeferredPromise<T> {
    promise: Promise<T>
    resolve: (value: T | PromiseLike<T>) => void
    reject: (reason?: string) => void
    settled: boolean
}

export function createDeferredPromise<T>(signal: AbortSignal): {
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (reason?: string) => void
    settled: () => boolean
} {
    let _resolve: ((value: T) => void) | undefined
    let _reject: ((reason?: string) => void) | undefined
    let settled = false

    const promise = new Promise<T>((resolve, reject) => {
        _resolve = (value: T) => {
            if (settled) {
                throw new Error('Deferred promise already settled')
            }
            settled = true
            resolve(value)
        }
        _reject = (reason?: string) => {
            if (settled) {
                throw new Error('Deferred promise already settled')
            }
            settled = true
            reject(reason)
        }
    })

    detach(promise, Reason.Deferred)

    signal.addEventListener('abort', () => {
        if (!settled) {
            _reject?.(
                typeof signal.reason === 'string'
                    ? signal.reason
                    : String(signal.reason)
            )
        }
    })

    return {
        promise,
        resolve: _resolve as unknown as (value: T) => void,
        reject: _reject as unknown as (reason?: string) => void,
        settled: () => settled,
    }
}
