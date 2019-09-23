import { browser } from '../../shared/globals';

type PendingPromise = {
    id: string;
    reject: (reason?: any) => void;
    resolve: (value?: any) => void;
};

type PendingResult = {
    id: string;
    done: boolean;
    error?: any;
    value?: any;
};

const promiseResultKey = '--promise-result--';
const pendingPromises = new Map<string, PendingPromise>();

const checkPromises = () => {
    browser.devtools.inspectedWindow.eval(`__webhint.checkEvaluateResults()`, (results: PendingResult[], err) => {
        if (err) {
            for (const [id, promise] of pendingPromises) {
                promise.reject(err);
                pendingPromises.delete(id);
            }

            return;
        }

        for (const result of results) {
            const { id } = result;
            const promise = pendingPromises.get(id);

            if (!promise) {
                continue;
            }

            if (result.error) {
                promise.reject(result.error);
            } else {
                promise.resolve(result.value);
            }

            pendingPromises.delete(id);
        }

        if (pendingPromises.size) {
            setTimeout(checkPromises, 100);
        }
    });
};

const queuePromise = (data: PendingPromise) => {
    if (!pendingPromises.size) {
        setTimeout(checkPromises, 10);
    }

    pendingPromises.set(data.id, data);
};

const createHelpersIfNeeded = (resultKey: string) => {
    if ((window as any).__webhint && (window as any).__webhint.checkEvaluateResults) {
        return;
    }

    let nextId = 0;
    const pendingResults = new Map<string, PendingResult>();

    const checkEvaluateResults = () => {
        const done = [];

        for (const [id, result] of pendingResults) {
            if (result.done) {
                done.push(result);
                pendingResults.delete(id);
            }
        }

        return done;
    };

    const queueEvaluateResult = () => {
        const id = `result-${nextId++}`;

        pendingResults.set(id, { done: false, id });

        return { [resultKey]: id };
    };

    (window as any).__webhint = {
        ...(window as any).__webhint,
        checkEvaluateResults,
        queueEvaluateResult
    };
};

export const evaluate = (code: string): Promise<any> => {
    const wrappedCode = `
        (function() {
            (${createHelpersIfNeeded})('${promiseResultKey}');
            var result = (${code});

            if (result && typeof result.then === 'function') {
                return __webhint.queueEvaluateResult(result);
            } else {
                return result;
            }
        })()
    `;

    return new Promise((resolve, reject) => {
        browser.devtools.inspectedWindow.eval(wrappedCode, (result, err) => {
            if (err) {
                reject(err);

                return;
            }

            if (typeof result === 'object' && result && promiseResultKey in result) {
                queuePromise({ id: (result as any)[promiseResultKey], reject, resolve });

                return;
            }

            resolve(result);
        });
    });
};
