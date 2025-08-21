import { command, state } from 'ccstate'

export function createResetSignal() {
    const controller$ = state<AbortController | null>(null)
    return {
        reset$: command(({ get, set }, ...signals: AbortSignal[]) => {
            get(controller$)?.abort()
            const controller = new AbortController()
            set(controller$, controller)
            return AbortSignal.any([controller.signal, ...signals])
        }),
    }
}
