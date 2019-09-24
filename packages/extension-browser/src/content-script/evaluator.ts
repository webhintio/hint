import { browser } from '../shared/globals';
import { Events } from '../shared/types';

type PendingEvaluate = {
    id: string;
    reject: (reason: any) => void;
    resolve: (value: any) => void;
};

export class Evaluator {
    private _nextEvaluateId = 0;
    private _pendingEvaluates = new Map<string, PendingEvaluate>();

    public constructor() {
        browser.runtime.onMessage.addListener((events: Events) => {
            if (events.evaluateResult) {
                const { id, err, value } = events.evaluateResult;
                const pending = this._pendingEvaluates.get(id);

                if (pending) {
                    if (err) {
                        pending.reject(err);
                    } else {
                        pending.resolve(value);
                    }

                    this._pendingEvaluates.delete(id);
                }
            }
        });
    }

    /**
     * Runs a script in the website context.
     *
     * By default, `eval` runs the scripts in a different context
     * but, some scripts, needs to run in the same context
     * of the website.
     */
    public evaluateInPage(code: string): Promise<any> {
        const id = `evaluate-${this._nextEvaluateId++}`;

        return new Promise((resolve, reject) => {
            const events: Events = { evaluate: { code, id } };

            browser.runtime.sendMessage(events);

            this._pendingEvaluates.set(id, { id, reject, resolve });
        });
    }
}
