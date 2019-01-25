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

type Initializer = (params: Partial<InitializeParams>) => Promise<InitializeResult>;
type FileWatcher = () => any;

export type Connection = {
    listen: () => void;
    onDidChangeWatchedFiles: (fn: FileWatcher) => void;
    onInitialize: (fn: Initializer) => void;
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
};

export const mocks = () => {
    const child = {
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
    const child_process = {
        spawn(cmd: string) {
            return child;
        }
    };

    const access = {
        error(): Error | null {
            return new Error('ENOENT');
        }
    };

    const fs = {
        access(path: string, callback: (err: Error | null) => void) {
            setTimeout(() => {
                callback(access.error());
            }, 0);
        }
    };

    const engine = {
        clear() { },
        executeOn(target: url.URL, options?: IFetchOptions): Partial<Problem>[] {
            return [];
        }
    };

    const Configuration = {
        fromConfig() { },
        getFilenameForDirectory() {
            return '';
        },
        loadConfigFile() { }
    };

    const loadResources = () => { };

    let fileWatcher: () => any;
    let initializer: (params: Partial<InitializeParams>) => Promise<InitializeResult>;

    const connection: Connection = {
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

    const createConnection = () => {
        return connection;
    };

    class Engine {
        public constructor() {
            return engine;
        }
    }

    const modules: { [name: string]: any } = {
        hint: { Engine },
        'hint/dist/src/lib/config': { Configuration },
        'hint/dist/src/lib/utils/resource-loader': { loadResources }
    };

    const Files = {
        resolveModule2(_context: string, name: string) {
            return modules[name];
        }
    };

    const ProposedFeatures = { all: {} };

    const document = {
        getText() {
            return '';
        },
        get uri() {
            return '';
        }
    } as TextDocument;

    let contentWatcher: (change: Partial<TextDocumentChangeEvent>) => any;

    const documents = {
        all(): TextDocument[] {
            return [];
        },
        listen() { },
        onDidChangeContent(fn: typeof contentWatcher) {
            contentWatcher = fn;
        }
    };



    return {
        access,
        child_process,
        Configuration,
        connection,
        createConnection,
        document,
        documents,
        engine,
        Files,
        fs,
        getContentWatcher: () => {
            return contentWatcher;
        },
        getFileWatcher: () => {
            return fileWatcher;
        },
        getInitializer: () => {
            return initializer;
        },
        ProposedFeatures,
        TextDocuments: class TextDocuments {
            public constructor() {
                return documents;
            }
        }
    };
};