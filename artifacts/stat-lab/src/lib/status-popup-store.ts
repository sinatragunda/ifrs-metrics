export type StatusPopupNotice = {
  id: string;
  message: string;
  isError: boolean;
  title?: string;
};

type Listener = (notice: StatusPopupNotice | null) => void;

let currentNotice: StatusPopupNotice | null = null;
const listeners = new Set<Listener>();

function emit(notice: StatusPopupNotice | null) {
  currentNotice = notice;
  for (const listener of listeners) listener(notice);
}

export function getStatusPopupNotice() {
  return currentNotice;
}

export function subscribeStatusPopup(listener: Listener) {
  listeners.add(listener);
  listener(currentNotice);
  return () => {
    listeners.delete(listener);
  };
}

export function showStatusPopup(input: { message: string; isError?: boolean; title?: string }) {
  emit({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message: input.message,
    isError: Boolean(input.isError),
    title: input.title,
  });
}

export function showErrorPopup(message: string, title?: string) {
  showStatusPopup({ message, isError: true, title });
}

export function showSuccessPopup(message: string, title?: string) {
  showStatusPopup({ message, isError: false, title });
}

export function clearStatusPopup() {
  emit(null);
}
