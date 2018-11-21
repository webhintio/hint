import {
    InitializeParams,
    InitializeResult,
    TextDocument,
    TextDocumentChangeEvent
} from 'vscode-languageserver';
import { Problem } from 'hint/dist/src/lib/types';

type Access = {
    error: () => Error | null;
}

type MessageResult = {
    title: string;
};

type MockWindow = {
    showErrorMessage: () => MessageResult;
    showInformationMessage: () => MessageResult;
    showWarningMessage: () => MessageResult;
};

type Connection = {
    listen: () => void;
    onDidChangeWatchedFiles: (fn: typeof fileWatcher) => void;
    onInitialize: (fn: typeof initializer) => void;
    sendDiagnostics: () => void;
    sendNotification: () => void;
    window: MockWindow;
}

type Documents = {
    all: () => TextDocument[];
    listen: () => void;
    onDidChangeContent: (fn: typeof contentWatcher) => void;
}

type EngineMock = {
    clear: () => void;
    executeOn: () => Partial<Problem>[];
}

export const child = {
    on(event: string, listener: () => void) {
        if (event === 'exit') {
            setTimeout(() => {
                listener();
            }, 0);
        }
    },
    stderr: { pipe() { } },
    stdout: { pipe() { } }
};

// eslint-disable-next-line
export const child_process = {
    spawn() {
        return child;
    }
};

export const access: Access = {
    error() {
        return new Error('ENOENT');
    }
};

export const fs = {
    access(path: string, callback: (err: Error | null) => void) {
        setTimeout(() => {
            callback(access.error());
        }, 0);
    }
};

export const engine: EngineMock = {
    clear() { },
    executeOn() {
        return [];
    }
};

export class Engine {
    public constructor() {
        return engine;
    }
}

export const Configuration = {
    fromConfig() { },
    getFilenameForDirectory() {
        return '';
    },
    loadConfigFile() { }
};

export const loadResources = () => { };

export let fileWatcher: () => any;
export let initializer: (params: Partial<InitializeParams>) => Promise<InitializeResult>;

export const connection: Connection = {
    listen() { },
    onDidChangeWatchedFiles(fn: typeof fileWatcher) {
        fileWatcher = fn;
    },
    onInitialize(fn: typeof initializer) {
        initializer = fn;
    },
    sendDiagnostics() { },
    sendNotification() { },
    window: {
        showErrorMessage() {
            return { title: '' }
        },
        showInformationMessage() {
            return { title: '' }
        },
        showWarningMessage() {
            return { title: '' }
        }
    }
};

export const createConnection = () => {
    return connection;
};

const modules: { [name: string]: any } = {
    hint: { Engine },
    'hint/dist/src/lib/config': { Configuration },
    'hint/dist/src/lib/utils/resource-loader': { loadResources }
};

export const Files = {
    resolveModule2(_context: string, name: string) {
        return modules[name];
    }
};

export const ProposedFeatures = { all: {} };

export const document = {
    getText() {
        return '';
    },
    get uri() {
        return '';
    }
} as TextDocument;

export let contentWatcher: (change: Partial<TextDocumentChangeEvent>) => any;

export const documents: Documents = {
    all() {
        return [];
    },
    listen() { },
    onDidChangeContent(fn: typeof contentWatcher) {
        contentWatcher = fn;
    }
};

export class TextDocuments {
    public constructor() {
        return documents;
    }
}
