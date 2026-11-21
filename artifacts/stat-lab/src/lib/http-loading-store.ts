type Listener = (pendingCount: number) => void;

let pendingCount = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(pendingCount);
}

export function getHttpPendingCount() {
  return pendingCount;
}

export function subscribeHttpLoading(listener: Listener) {
  listeners.add(listener);
  listener(pendingCount);
  return () => {
    listeners.delete(listener);
  };
}

export function beginHttpRequest() {
  pendingCount += 1;
  emit();
}

export function endHttpRequest() {
  pendingCount = Math.max(0, pendingCount - 1);
  emit();
}
