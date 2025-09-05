import { throwIfNotAbort } from './abort-error'

export enum Reason {
    /**
     * Daemon 意味着这个 Promise 是一个永不 resolve 的后台任务，如协同的长连接通道
     */
    Daemon = 'daemon',

    /**
     * 作为 DOM Event Callback 的 async function 返回的 promise 对 DOM 来说没有意义，如 onScroll, onClick 等事件回调
     * React 的渲染完成也会被认为是一个 DOM Event，因此在 onRef 中也会用到
     */
    DomCallback = 'dom_callback',

    /**
     * 对于一个项目应该只有一个 main 函数需要用 ENTRANCE 来标记 flaoting promise，如:
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
     * Deferred 意味着这个 Promise 是一个延迟执行的任务
     * 创建 Deferred 的场合并不确定这个 Promise 是否会被使用
     * 所以对于有可能被 Reject 的 Deferred，需要在创建时收集
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

    if (silencePromise) {
        collectedPromise.add(silencePromise)
        promiseReason.set(silencePromise, reason)
        if (description) {
            promiseDescription.set(silencePromise, description)
        }
    }
}
