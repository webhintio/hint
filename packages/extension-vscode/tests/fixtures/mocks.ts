import {
    InitializeParams,
    InitializeResult,
    TextDocument,
    TextDocumentChangeEvent,
    PublishDiagnosticsParams
} from 'vscode-languageserver';
import { Endpoint, AnalyzerResult } from 'hint';

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
    const analyzer = {
        analyze(endpoints: Endpoint): Promise<AnalyzerResult[]> {
            return Promise.resolve([]);
        }
    }

    class Analyzer {
        private constructor() { }
        public static create() {
            return analyzer;
        }
        public static getUserConfig() {
        }
    }

    const createAnalyzer = Analyzer.create;
    const getUserConfig = Analyzer.getUserConfig;

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

    const modules: { [name: string]: any } = {
        hint: { createAnalyzer, getUserConfig }
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
        /*
         * 'as any' to avoid error:
         * Exported variable 'mocks' has or is using private name 'Analyzer'.
         *
         * We need to export Analyzer to be able to stub 'Analyzer.create'.
         */
        Analyzer: Analyzer as any,
        analyzer,
        child_process,
        connection,
        createConnection,
        document,
        documents,
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
        modules,
        ProposedFeatures,
        TextDocuments: class TextDocuments {
            public constructor() {
                return documents;
            }
        }
    };
};
