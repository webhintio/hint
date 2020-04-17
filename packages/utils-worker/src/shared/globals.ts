type Scope = {
    addEventListener(name: 'message', handler: (event: MessageEvent) => void): void;
    postMessage(data: any): void;
    removeEventListener(name: 'message', handler: (event: MessageEvent) => void): void;
}

// Include references to web worker globals to facilitate mocks during testing.
const _self: Scope = self as any;

export { _self as self };
