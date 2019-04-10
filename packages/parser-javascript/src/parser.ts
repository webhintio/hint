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

/**
 * A WalkArray is a pair of Key and a Map with
 * all the callbacks (for methods full and fullAncestor)
 * or all the NodeVisitor (for methods simple and ancestor) for that Key.
 *
 * The key is the same if the root node, the base and the state
 * you call walk.(simple|ancestor|full|fullAncestor) is the same.
 *
 * In case of method used is `full` or `fullAncestor`, the map will
 * have an only key `callbacks`.
 */
type WalkArray = Array<[Key, Map<string, Array<Function>>]>;

export default class JavascriptParser extends WebhintParser<ScriptEvents> {
    public constructor(engine: Engine<ScriptEvents>) {
        super(engine, 'javascript');

        engine.on('fetch::end::script', this.parseJavascript.bind(this));
        engine.on('element::script', this.parseJavascriptTag.bind(this));
    }

    private getCurrentVisitorsOrCallback(walkArray: WalkArray, node: ESTree.Node, base?: NodeVisitor, state?: any) {
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

            // Store a WalkArray for each method supported.
            const walkArrays: { [t: string]: WalkArray } = {};

            /**
             * Create a method that will create a WalkArray for a walk method (simple, full, etc.).
             */
            const getWalkAccumulator = (methodName: string) => {
                if (!walkArrays[methodName]) {
                    walkArrays[methodName] = [];
                }

                /**
                 * Every time a hint calls to walk.(simple|ancestor|full|fullAncestor), it is going to
                 * execute this method, storing in a WalkArray object all the NodeVistors or Callbacks
                 * the hints are defining for the walk method.
                 *
                 * This will allow later generate our custom NodeVisitor(s) or callback to call the
                 * real `acorn-walk` method, so we just need to walk once for each Key (node + base + state)
                 * and method.
                 *
                 * E.g:
                 * For the script1.js
                 *
                 * hint 1: call to walk.simple(ast, {
                 *     CallExpression(node) { // this is a NodeVisitor
                 *         // any code here
                 *     }
                 * });
                 *
                 * hint 2: call to walk.simple(ast, {
                 *     CallExpression(node) { // This is a NodeVisitor
                 *         // any other code here
                 *     }
                 * });
                 *
                 * hint 3: call to walk.simple(ast, {
                 *     Literal(node) { // This is a NodeVisitor
                 *         // any code for Literal.
                 *     }
                 * });
                 *
                 * hint 3: call to walk.full(ast, (node) => {
                 *   // Callback code here.
                 * });
                 *
                 * These hints will create two WalkArray, one for the method `simple` and another one
                 * for the method `full`.
                 *
                 * The WalkArray object for `simple` will have a map with 2 entries, the key of the first entry
                 * will be `CallExpression` and the content for that entry will be an array with 2 NodeVisitors,
                 * one from `hint 1`, and another from the `hint 2`. The key for the second entry will be `Literal`
                 * and the content for that entry will be an array with 1 NodeVisitor the one from `hint 3`
                 *
                 * The WalkArray object for `full` will hava a map with 1 entry, the key of that entry will
                 * be `callbacks`, and the content for that entry will be an array with 1 function. That function
                 * is the function defined in `hint 4`
                 */
                return (node: ESTree.Node, visitorsOrCallback: NodeVisitor | Function, base?: NodeVisitor, state?: any) => {
                    let currentVisitors = this.getCurrentVisitorsOrCallback(walkArrays[methodName], node, base, state);

                    if (!currentVisitors) {
                        currentVisitors = new Map();
                        walkArrays[methodName].push([{ base, node, state }, currentVisitors]);
                    }

                    if (typeof visitorsOrCallback === 'function') {
                        const name = 'callbacks';

                        let visitorCallbacks = currentVisitors.get(name);

                        if (!visitorCallbacks) {
                            visitorCallbacks = [];
                        }

                        visitorCallbacks.push(visitorsOrCallback);

                        currentVisitors.set(name, visitorCallbacks);

                        return;
                    }

                    for (const [name, callback] of Object.entries(visitorsOrCallback)) {
                        let visitorCallbacks = currentVisitors.get(name);

                        if (!visitorCallbacks) {
                            visitorCallbacks = [];
                        }

                        visitorCallbacks.push(callback!);

                        currentVisitors.set(name, visitorCallbacks);
                    }
                };
            };

            const walk: Walk = {
                ancestor: getWalkAccumulator('ancestor'),
                full: getWalkAccumulator('full'),
                fullAncestor: getWalkAccumulator('fullAncestor'),
                simple: getWalkAccumulator('simple')
            };

            await this.engine.emitAsync(`parse::end::javascript`, {
                ast,
                element,
                resource,
                sourceCode,
                tokens,
                walk
            });

            /**
             * After all the hints have registered their NodeVisitor or callback,
             * it is time to generate a single NodeVisitor for each different
             * NodeVisitor registered by the hints and execute the real walk.
             *
             * Continuing with the previous example, this code will execute:
             *
             * acornWalk.simple(ast, {
             *     CallExpresion(node) {
             *         // code from CallExpression in hint 1
             *         // code from CallExpression in hint 2
             *     },
             *     Literal(node) {
             *         // code from Literal in hint 3
             *     }
             * });
             *
             * acornWalk.ful(ast, (node) => {
             *     // code from callback in hint 4
             * });
             */
            Object.entries(walkArrays).forEach(([methodName, walkArray]) => {
                walkArray.forEach(([{ node, state, base }, visitors]) => {
                    let allVisitors: NodeVisitor | Function = {};

                    visitors.forEach((callbacks, name) => {
                        if (typeof allVisitors !== 'function') {
                            /* istanbul ignore next */
                            allVisitors[name as keyof NodeVisitor] = (callbackNode: ESTree.Expression, ancestors?: ESTree.Node[]) => {
                                callbacks.forEach((callback: Function) => {
                                    callback(callbackNode, ancestors);
                                });
                            };

                            return;
                        }

                        /* istanbul ignore next */
                        allVisitors = (callbackNode: ESTree.Node, callbackState: any, typeOrAncestors: string | ESTree.Node[]) => {
                            callbacks.forEach((callback: Function) => {
                                callback(callbackNode, callbackState, typeOrAncestors);
                            });
                        };
                    });

                    acornWalk[methodName](node, allVisitors, base, state);
                });
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
