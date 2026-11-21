export type HttpErrorNotice = {
  id: string;
  message: string;
  status?: number;
  url?: string;
};

type Listener = (notice: HttpErrorNotice | null) => void;

let currentNotice: HttpErrorNotice | null = null;
const listeners = new Set<Listener>();

function emit(notice: HttpErrorNotice | null) {
  currentNotice = notice;
  for (const listener of listeners) listener(notice);
}

export function getHttpErrorNotice() {
  return currentNotice;
}

export function subscribeHttpError(listener: Listener) {
  listeners.add(listener);
  listener(currentNotice);
  return () => {
    listeners.delete(listener);
  };
}

export function publishHttpError(input: { message: string; status?: number; url?: string }) {
  emit({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message: input.message,
    status: input.status,
    url: input.url,
  });
}

export function clearHttpError() {
  emit(null);
}
