import { Options, parse, tokenizer } from 'acorn';
import * as acornWalk from 'acorn-walk';
import * as ESTree from 'estree';

import { HTMLElement } from '@hint/utils/dist/src/dom/html';
import * as logger from '@hint/utils/dist/src/logging';
import { determineMediaTypeForScript } from 'hint/dist/src/lib/utils/content-type';
import { ElementFound, FetchEnd, Parser as WebhintParser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';

import { ScriptEvents, Walk, NodeVisitor } from './types';

export * from './types';

type Key = {
    node: ESTree.Node;
    base?: NodeVisitor;
    state?: any;
};

type WalkArray = Array<[Key, Map<string, Array<any>>]>;

export default class JavascriptParser extends WebhintParser<ScriptEvents> {
    public constructor(engine: Engine<ScriptEvents>) {
        super(engine, 'javascript');

        engine.on('fetch::end::script', this.parseJavascript.bind(this));
        engine.on('element::script', this.parseJavascriptTag.bind(this));
    }

    private getCurrentVisitors(walkArray: WalkArray, node: ESTree.Node, base?: NodeVisitor, state?: any) {
        const item = walkArray.find(([key]) => {
            return key.node === node && key.base === base && key.state === state;
        });

        return item ? item[1] : null;
    }

    private async emitScript(sourceCode: string, resource: string, element: HTMLElement | null) {
        try {
            await this.engine.emitAsync(`parse::start::javascript`, { resource });

            const options: Options = { locations: true };
            const ast = parse(sourceCode, options) as ESTree.Node;
            const tokens = [...tokenizer(sourceCode, options)];

            /*
             * We will need an array for each walk method supported.
             */
            const walkArray: WalkArray = [];

            /*
             * For now, only `walk.simple` is supported.
             * When support for any other method is added we will need
             * to reuse this method (in case of `ancestor`) or create
             * a new one if the signature is not the same.
             */
            const simple = (node: ESTree.Node, visitors: NodeVisitor, base?: NodeVisitor, state?: any) => {
                let currentVisitors: Map<string, Array<any>> | null = this.getCurrentVisitors(walkArray, node, base, state);

                if (!currentVisitors) {
                    currentVisitors = new Map();
                    walkArray.push([{ base, node, state }, currentVisitors]);
                }

                Object.entries(visitors).forEach(([name, callback]) => {
                    let visitorCallbacks = currentVisitors!.get(name);

                    if (!visitorCallbacks) {
                        visitorCallbacks = [];
                    }

                    visitorCallbacks.push(callback);

                    currentVisitors!.set(name, visitorCallbacks);
                });
            };

            const walk: Walk = { simple };

            await this.engine.emitAsync(`parse::end::javascript`, {
                ast,
                element,
                resource,
                sourceCode,
                tokens,
                walk
            });

            walkArray.forEach(([{ node }, visitors]) => {
                const fullVisitors: any = {};

                visitors.forEach((callbacks, name) => {
                    fullVisitors[name] = (n: ESTree.Expression) => {
                        callbacks.forEach((c: Function) => {
                            c(n);
                        });
                    };
                });

                acornWalk.simple(node, fullVisitors);
            });
        } catch (err) {
            logger.error(`Error parsing JS code: ${sourceCode}`);
        }
    }

    private async parseJavascript(fetchEnd: FetchEnd) {
        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;

        await this.emitScript(code, resource, null);
    }

    private hasSrcAttribute(element: HTMLElement) {
        const src = element.getAttribute('src');

        return !!src;
    }


    private isJavaScriptType(element: HTMLElement) {
        const type = determineMediaTypeForScript(element);

        return !!type;
    }

    private async parseJavascriptTag({ element, resource }: ElementFound) {
        if (this.hasSrcAttribute(element)) {
            // Ignore because this will be (or have been) processed in the event 'fetch::end::script'.
            return;
        }

        if (!this.isJavaScriptType(element)) {
            // Ignore if it is not javascript.
            return;
        }

        await this.emitScript(element.innerHTML, resource, element);
    }
}
