/**
 * @fileoverview webhint parser needed to analyze TypeScript files.
 */
import { debug as d } from '@hint/utils/dist/src/debug';
import { Parser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { Node, ScriptEvents } from '@hint/parser-javascript';
import { base, combineWalk } from '@hint/parser-javascript/dist/src/walk';

const debug = d(__filename);

let TypeScriptESTree: typeof import('@typescript-eslint/typescript-estree') | null = null;

try {
    TypeScriptESTree = require('@typescript-eslint/typescript-estree');
} catch (e) {
    debug(`Unable to load TypeScript parser: ${e}`);
}

if (TypeScriptESTree) {
    // Extend `walk` to skip over most TS-specific nodes.
    for (const type of Object.keys(TypeScriptESTree.AST_NODE_TYPES)) {
        // Ensure `value` of `ClassProperty` instances is walked.
        if (type === 'ClassProperty') {
            base[type] = (node: any, st: any, c: any) => {
                if (node.value) {
                    c(node.value, st);
                }
            };
        }

        // Just ignore anything else
        if (!base[type]) {
            base[type] = base.Identifier;
        }
    }
}

export default class TypeScriptParser extends Parser<ScriptEvents> {

    public constructor(engine: Engine<ScriptEvents>) {
        super(engine, 'typescript');

        engine.on('fetch::end::unknown', async ({ resource, response }) => {
            if (!resource.endsWith('.ts') && !resource.endsWith('.tsx')) {
                return;
            }

            if (!TypeScriptESTree) {
                return;
            }

            debug(`Parsing TypeScript file: ${resource}`);

            const sourceCode = response.body.content;
            const jsx = resource.endsWith('.tsx');

            try {
                await engine.emitAsync('parse::start::javascript', { resource });

                const result = TypeScriptESTree.parse(sourceCode, { jsx, loc: true, useJSXTextNode: jsx });

                await combineWalk(async (walk) => {
                    await engine.emitAsync('parse::end::javascript', {
                        ast: result as Node,
                        element: null,
                        resource,
                        sourceCode,
                        tokens: result.tokens as any,
                        walk
                    });
                });

            } catch (err) {
                debug(`Error parsing TypeScript code (${err}): ${sourceCode}`);
            }
        });
    }
}
