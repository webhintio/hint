type Scope = {
    addEventListener(name: 'message', handler: (event: MessageEvent) => void): void;
    postMessage(data: any): void;
    removeEventListener(name: 'message', handler: (event: MessageEvent) => void): void;
    screen: {};
}

// Include references to web worker globals to facilitate mocks during testing.
const _self: Scope = self as any;

if (!_self.screen) {
    _self.screen = {};
}

export { _self as self };
