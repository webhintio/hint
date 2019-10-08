import { Token } from 'acorn';
import { Node } from 'estree-jsx';

import { HTMLElement } from '@hint/utils/dist/src/dom/html';
import { Event, Events } from 'hint/dist/src/lib/types/events';

export * from 'estree-jsx';

/** All possible values for the Node `type` property. */
type NodeTypes = Node['type'];

/**
 * Resolve a Node type based on a specified value for the `type` property.
 *
 * Based on http://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
 *
 * ```ts
 *     // T === SimpleCallExpression
 *     type T = NodeTypeForValue<Node, 'SimpleCallExpression'>;
 * ```
 */
type NodeTypeForValue<N, T> = N extends { type: T } ? N : never;

/**
 * Object with optional properties for each possible value of `type`.
 * Each property references a method taking a `node` of the type
 * which corresponds to the value of `type` represented by the property name.
 * And optionally the ancestors of that node if we are using `ancestor` for the
 * walk.
 *
 * ```ts
 * const visitor: NodeVisitor = {
 *     Literal(node, ancestors) {
 *         // node is correctly narrowed to type Literal from ESTree
 *     }
 * }
 * ```
 */
export type NodeVisitor = { [T in NodeTypes]?: (node: NodeTypeForValue<Node, T>, ancestors?: Node[]) => void };

export type WalkCompleteListener = () => Promise<void> | void;

// TODO: Define types for all `acorn-walk` helpers and use them instead.
export type WalkMethods = {
    /**
     * Does a 'simple' walk over a tree. `node` should be the AST node to walk,
     * and `visitors` an object with properties whose names correspond to node
     * types in the ESTree spec. The properties should contain functions that
     * will be called with the node object and, if applicable the state at that
     * point. The last two arguments are optional. `base` is a walker
     * algorithm, and `state` is a start state. The default walker will simply
     * visit all statements and expressions and not produce a meaningful state.
     * (An example of a use of state is to track scope at each point in the
     * tree.)
     *
     * From `acorn-walk` (https://github.com/acornjs/acorn/tree/master/acorn-walk)
     */
    simple(node: Node, visitors: NodeVisitor, base?: NodeVisitor, state?: any): void;
    ancestor(node: Node, visitors: NodeVisitor, base?: NodeVisitor, state?: any): void;
    full(node: Node, callback: (node: Node, state: any, type: string) => void, base?: NodeVisitor, state?: any): void;
    fullAncestor(node: Node, callback: (node: Node, state: any, ancestors: Node[]) => void, base?: NodeVisitor, state?: any): void;
};

export type WalkEvents = {
    /**
     * Register a callback to execute once the walks have actually been performed.
     * Necessary because walks are performed slightly delayed so they can be
     * batched across multiple listeners for performance.
     */
    onComplete: (listener: WalkCompleteListener) => void;
};

export type Walk = WalkMethods & WalkEvents;

/** The object emitted by the `javascript` parser */
export type ScriptParse = Event & {
    /** The `ESTree` AST generated from the script */
    ast: Node;
    /** The originating <script> element if the script was inline */
    element: HTMLElement | null;
    /** The source code parsed */
    sourceCode: string;
    /** A list of tokens generated from the source code */
    tokens: Token[];
    /** Helper methods from `acorn-walk` for walking the AST */
    walk: Walk;
};

export type ScriptEvents = Events & {
    'parse::end::javascript': ScriptParse;
    'parse::start::javascript': Event;
};
