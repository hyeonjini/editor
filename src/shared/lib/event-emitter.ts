type Listener<T> = (payload: T) => void;

export interface EventEmitter<T> {
  emit(payload: T): void;
  subscribe(listener: Listener<T>): () => void;
}

export const createEventEmitter = <T>(): EventEmitter<T> => {
  const listeners = new Set<Listener<T>>();

  return {
    emit(payload) {
      listeners.forEach((listener) => listener(payload));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
