import { command, type Command, computed, type Computed, state } from "ccstate";
import { createResetSignal } from "./reset-signal";

export function createSwitchSignal(): {
  switch$: Command<AbortSignal, AbortSignal[]>;
  signal$: Computed<AbortSignal>;
} {
  const { reset$: resetSignal$ } = createResetSignal();
  const internalSignal$ = state<AbortSignal>(AbortSignal.abort());

  return {
    switch$: command(({ set }, ...signals: AbortSignal[]) => {
      const resetSignal = set(resetSignal$, ...signals);
      set(internalSignal$, resetSignal);
      return resetSignal;
    }),
    signal$: computed((get) => {
      return get(internalSignal$);
    }),
  };
}
