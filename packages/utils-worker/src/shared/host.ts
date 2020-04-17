import { self } from './globals';
import { HostEvents, WorkerEvents } from './types';

export type HostListener = (message: HostEvents) => void;

const listeners = new Set<HostListener>();

self.addEventListener('message', (event) => {
    for (const listener of listeners) {
        listener(event.data);
    }
});

/**
 * Add a listener for events received from the host.
 */
export const addHostListener = (listener: HostListener) => {
    listeners.add(listener);
};

/**
 * Send the provided event to the host.
 */
export const notifyHost = (event: WorkerEvents) => {
    self.postMessage(event);
};

/**
 * Remove a listener registered to receive events from the host.
 */
export const removeHostListener = (listener: HostListener) => {
    listeners.delete(listener);
};
