import * as url from 'url';

import {
    InitializeParams,
    InitializeResult,
    TextDocument,
    TextDocumentChangeEvent,
    PublishDiagnosticsParams
} from 'vscode-languageserver';
import { Problem, IFetchOptions } from 'hint/dist/src/lib/types';

export type Message = {
    title: string;
};

export type Window = {
    showErrorMessage: () => Message;
    showInformationMessage: () => Message;
    showWarningMessage: () => Message;
};

export type Connection = {
    listen: () => void;
    onDidChangeWatchedFiles: (fn: typeof fileWatcher) => void;
    onInitialize: (fn: typeof initializer) => void;
    sendDiagnostics: (params: PublishDiagnosticsParams) => void;
    sendNotification: () => void;
    window: Window;
}

export type EngineType = {
    clear: () => void;
    executeOn: (target: url.URL, options?: IFetchOptions) => Partial<Problem>[];
}

export type Std = {
    pipe: () => void;
};

export type Child = {
    on: (event: string, listener: () => void) => void;
    stderr: Std;
    stdout: Std;
}

export type ChildProcess = {
    spawn: (cmd: string) => Child;
};

export type FilesType = {
    resolveModule2: (_context: string, name: string) => any;
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
export const child_process: ChildProcess = {
    spawn(cmd: string) {
        return child;
    }
};

export const access = {
    error(): Error | null {
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

export const engine: EngineType = {
    clear() { },
    executeOn(target: url.URL, options?: IFetchOptions): Partial<Problem>[] {
        return [];
    }
};

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
    sendDiagnostics(params: PublishDiagnosticsParams) { },
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

export class Engine {
    public constructor() {
        return engine;
    }
}

const modules: { [name: string]: any } = {
    hint: { Engine },
    'hint/dist/src/lib/config': { Configuration },
    'hint/dist/src/lib/utils/resource-loader': { loadResources }
};

export const Files: FilesType = {
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

export const documents = {
    all(): TextDocument[] {
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
