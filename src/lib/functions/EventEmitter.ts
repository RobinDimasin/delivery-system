type Listener = (...arg: any) => void;

export default class EventEmitter {
  #onListeners = new Map<string, Set<Listener>>();

  on(key: string, listener: Listener) {
    if (!this.#onListeners.get(key)) {
      this.#onListeners.set(key, new Set());
    }

    this.#onListeners.get(key).add(listener);

    return () => {
      this.#onListeners.get(key).delete(listener);
    };
  }

  emit(key: string, ...args: any) {
    const listeners = this.#onListeners.get(key);

    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }
}
