import * as acornWalk from 'acorn-walk';
import { Node } from 'estree-jsx';
import { NodeVisitor, Walk, WalkMethods, WalkCompleteListener } from './types';

const { extend } = require('acorn-jsx-walk');

extend(acornWalk.base); // Add `walk` support for JSXElement, etc.

type Key = {
    node: Node;
    base?: NodeVisitor;
    state?: any;
};

const getCurrentVisitorsOrCallback = (walkArray: WalkArray, node: Node, base?: NodeVisitor, state?: any) => {
    const item = walkArray.find(([key]) => {
        return key.node === node && key.base === base && key.state === state;
    });

    return item ? item[1] : null;
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
type WalkArray = Array<[Key, Map<keyof NodeVisitor | 'callbacks', Function[]>]>;
type WalkArrays = { [key in keyof WalkMethods]: WalkArray };

const defaultCallbacksProperty = 'callbacks';


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
 * acornWalk.full(ast, (node) => {
 *     // code from callback in hint 4
 * });
 */
const performWalk = (walkArrays: WalkArrays) => {
    Object.entries(walkArrays).forEach(([methodName, walkArray]) => {
        walkArray.forEach(([{ node, state, base }, visitors]) => {
            let allVisitors: NodeVisitor | Function = {};

            if (visitors.has(defaultCallbacksProperty)) {
                // `full` and `fullAncestor` only track an array of callbacks.
                const callbacks = visitors.get(defaultCallbacksProperty)!;

                /* istanbul ignore next */
                allVisitors = (callbackNode: Node, callbackState: any, typeOrAncestors: string | Node[]) => {
                    callbacks.forEach((callback: Function) => {
                        callback(callbackNode, callbackState, typeOrAncestors);
                    });
                };
            } else {
                // `ancestor` and `simple` track an array of NodeVisitors which need merged.
                for (const [name, callbacks] of visitors) {
                    /* istanbul ignore next */
                    (allVisitors as any)[name] = (callbackNode: Node, ancestors?: Node[]) => {
                        callbacks.forEach((callback: Function) => {
                            callback(callbackNode, ancestors);
                        });
                    };
                }
            }

            acornWalk[methodName](node, allVisitors, base, state);
        });
    });
};

const prepareWalk = () => {
    // Store a WalkArray for each method supported.
    const walkArrays: WalkArrays = {
        ancestor: [],
        full: [],
        fullAncestor: [],
        simple: []
    };

    /**
     * Create a method that will create a WalkArray for a walk method (simple, full, etc.).
     */
    const getWalkAccumulator = <K extends keyof WalkMethods>(methodName: K): WalkMethods[K] => {
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
         * hint 4: call to walk.full(ast, (node) => {
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
        return (node: Node, visitorsOrCallback: NodeVisitor | Function, base?: NodeVisitor, state?: any) => {
            let currentVisitors = getCurrentVisitorsOrCallback(walkArrays[methodName], node, base, state);

            if (!currentVisitors) {
                currentVisitors = new Map();
                walkArrays[methodName].push([{ base, node, state }, currentVisitors]);
            }

            if (typeof visitorsOrCallback === 'function') {
                // `full` and `fullAncestor` only track an array of callbacks.
                const name = defaultCallbacksProperty;
                const visitorCallbacks = currentVisitors.get(name) || [];

                visitorCallbacks.push(visitorsOrCallback);
                currentVisitors.set(name, visitorCallbacks);
            } else {
                // `ancestor` and `simple` track an array of NodeVisitors.
                for (const [name, callback] of Object.entries(visitorsOrCallback)) {
                    const mapName = name as keyof NodeVisitor;
                    const visitorCallbacks = currentVisitors.get(mapName) || [];

                    visitorCallbacks.push(callback!);
                    currentVisitors.set(mapName, visitorCallbacks);
                }
            }
        };
    };

    const listeners: WalkCompleteListener[] = [];
    const onComplete = (listener: WalkCompleteListener) => {
        listeners.push(listener);
    };

    const walk: Walk = {
        ancestor: getWalkAccumulator('ancestor'),
        full: getWalkAccumulator('full'),
        fullAncestor: getWalkAccumulator('fullAncestor'),
        onComplete,
        simple: getWalkAccumulator('simple')
    };

    return { listeners, walk, walkArrays };
};

/**
 * Batch multiple AST `walk.*` calls during a registration period, then execute
 * them in a single pass of the AST.
 *
 * This improves performance by avoiding multiple redundant walks, but requires
 * registering an `onComplete` callback for consumers which need to
 * post-process accumulated state after the walk is finished.
 */
export const combineWalk = async (register: (walk: Walk) => Promise<void>) => {
    const { listeners, walk, walkArrays } = prepareWalk();

    await register(walk);

    performWalk(walkArrays);

    await Promise.all(listeners.map((listener) => {
        return listener();
    }));
};
