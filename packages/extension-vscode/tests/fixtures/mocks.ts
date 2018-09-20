import {
    InitializeParams,
    InitializeResult,
    TextDocument,
    TextDocumentChangeEvent
} from 'vscode-languageserver';

export const child = {
    on(event: string, listener: () => void) {
        if (event === 'exit') {
            setTimeout(() => {
                listener();
            }, 0);
        }
    },
    stderr: { pipe() { }},
    stdout: { pipe() { }}
};

// eslint-disable-next-line
export const child_process = {
    spawn() {
        return child;
    }
};

export const access = {
    error() {
        return new Error('ENOENT');
    }
};

export const fs = {
    access(path: string, callback: (err) => void) {
        setTimeout(() => {
            callback(access.error());
        }, 0);
    }
};

export const engine = {
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

export const connection = {
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
        showErrorMessage() { },
        showInformationMessage() { },
        showWarningMessage() { }
    }
};

export const createConnection = () => {
    return connection;
};

const modules = {
    hint: { Engine },
    'hint/dist/src/lib/config': { Configuration },
    'hint/dist/src/lib/utils/resource-loader': { loadResources }
};

export const Files = {
    resolveModule2(_context: string, name: string) {
        return modules[name];
    }
};

export const ProposedFeatures = { all: { } };

export const document = {
    getText() {
        return '';
    },
    get uri() {
        return '';
    }
} as TextDocument;

export let contentWatcher: (change: Partial<TextDocumentChangeEvent>) => any;

export const documents = {
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
