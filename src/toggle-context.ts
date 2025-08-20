import { Command, command, state } from "ccstate";
import { createSwitchSignal } from "./switch-signal";

export function createToggleContext({
  init$,
  toggle$,
  clear$,
}: {
  init$?: Command<Promise<void>, [AbortSignal]>;
  toggle$?: Command<Promise<void>, [AbortSignal]>;
  clear$?: Command<void, never[]>;
}) {
  const { switch$, signal$ } = createSwitchSignal();
  const internalToggle$ = command(async ({ get, set }) => {
    const signal = get(signal$);
    const toggleSignal = set(switch$, signal);
    if (toggle$) {
      await set(toggle$, toggleSignal);
    }
  });
  const internalInit$ = command(async ({ set }, signal: AbortSignal) => {
    const initSignal = set(switch$, signal);
    if (init$) {
      await set(init$, initSignal);
    }
    initSignal.addEventListener("abort", () => {
      if (clear$) {
        set(clear$);
      }
    });
  });
  return {
    init$: internalInit$,
    toggle$: internalToggle$,
  } as const;
}
