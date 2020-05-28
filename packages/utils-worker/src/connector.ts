import { URL } from 'url';

import { Engine } from 'hint';
import {
    DocumentData,
    HTMLDocument,
    HTMLElement,
    populateGlobals,
    restoreReferences,
    traverse
} from '@hint/utils-dom';
import {
    IConnector,
    FetchEnd,
    NetworkData
} from 'hint/dist/src/lib/types';

import { self } from './shared/globals';
import { addHostListener, notifyHost } from './shared/host';
import { finalizeFetchEnd } from './shared/network';

export default class WebWorkerConnector implements IConnector {
    private _document: HTMLDocument | undefined;
    private _originalDocument: HTMLDocument | undefined;
    private _engine: Engine;
    private _onComplete: (err: Error | null, resource?: string) => void = () => { };
    private _resource = '';

    public static schema = {};

    public constructor(engine: Engine) {
        this._engine = engine;

        (engine as Engine<import('@hint/parser-html').HTMLEvents>).on('parse::end::html', (event) => {
            /* istanbul ignore else */
            if (event.resource === this._resource) {
                this._originalDocument = event.document;
            }
        });

        const onSnapshot = async (snapshot: DocumentData) => {
            const resource = this._resource;

            try {
                restoreReferences(snapshot);

                this._document = new HTMLDocument(snapshot, this._resource, this._originalDocument);

                await traverse(this._document, this._engine, resource);

                /*
                 * Evaluate after the traversing, just in case something goes wrong
                 * in any of the evaluation and some scripts are left in the DOM.
                 */
                const event = {
                    document: this._document,
                    resource
                };

                await this._engine.emitAsync('can-evaluate::script', event);
                await this._engine.emitAsync('scan::end', { resource });

            } catch (err) /* istanbul ignore next */ {
                this._onComplete(err);
            }
        };

        addHostListener(async (events) => {
            try {
                if (events.fetchEnd) {
                    await this.notifyFetch(events.fetchEnd);
                }
                if (events.fetchStart) {
                    await this._engine.emitAsync('fetch::start', events.fetchStart);
                }
                if (events.snapshot) {
                    await onSnapshot(events.snapshot);
                }
                /**
                 * NOTE: We _know_ that the above processing
                 * has synchronously updated the engine's messages
                 * so here we "flush" the message to the host.
                 */
                await this._engine.notify(this._resource);
                this._engine.clear();
            } catch (err) /* istanbul ignore next */ {
                this._onComplete(err);
            }
        });
    }

    private async notifyFetch(event: FetchEnd) {
        const { type } = await finalizeFetchEnd(event, this._document);

        await this._engine.emitAsync(`fetch::end::${type}` as 'fetch::end::*', event);
    }

    /* istanbul ignore next */
    public fetchContent(): Promise<NetworkData> {
        throw new Error('Not implemented');
    }

    public async collect(target: URL) {
        const resource = this._resource = target.href;

        await this._engine.emitAsync('scan::start', { resource });

        notifyHost({ ready: true });

        return new Promise((resolve, reject) => {
            this._onComplete = async (err: Error | null, resource = '') => {
                /* istanbul ignore if */
                if (err) {
                    reject(err);

                    return;
                }

                try {
                    await this._engine.emitAsync('scan::end', { resource });
                    resolve();
                    notifyHost({ done: true });
                } catch (e) /* istanbul ignore next */ {
                    reject(e);
                }
            };
        });
    }

    public async evaluate(source: string): Promise<any> {
        if (!this._document) {
            throw new Error('No execution context is available');
        }

        populateGlobals(self, this._document);

        return await eval(source); // eslint-disable-line no-eval
    }

    public querySelectorAll(selector: string): HTMLElement[] {
        return this._document ? this._document.querySelectorAll(selector) : [];
    }

    /* istanbul ignore next */
    public close() {
        return Promise.resolve();
    }

    public get dom(): HTMLDocument | undefined {
        return this._document;
    }

    /* istanbul ignore next */
    public get html(): string {
        return this._document ? this._document.pageHTML() : '';
    }
}
