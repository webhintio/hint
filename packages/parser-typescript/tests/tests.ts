import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Engine, FetchEnd } from 'hint';
import { HTMLEvents, HTMLParse } from '@hint/parser-html';
import { CallExpression, ScriptEvents } from '@hint/parser-javascript';
import { base } from '@hint/parser-javascript/dist/src/walk';
import JSXParser from '@hint/parser-jsx';

import TypeScriptParser from '../src/parser';

const emitFetchEndTSX = async (engine: Engine<ScriptEvents & HTMLEvents>, content: string) => {
    let event = {} as HTMLParse;

    engine.on('parse::end::html', (e) => {
        event = e;
    });

    await engine.emitAsync('fetch::end::unknown', {
        resource: 'https://webhint.io/test.tsx',
        response: {
            body: { content },
            mediaType: 'text/x-typescript'
        }
    } as FetchEnd);

    return event;
};

const getPropertyName = (node: CallExpression) => {
    const callee = node.callee;
    const property = callee.type === 'MemberExpression' && callee.property;
    const propertyName = property && property.type === 'Identifier' && property.name;

    return propertyName;
};

const mockEngine = () => {
    return new EventEmitter2({
        delimiter: '::',
        wildcard: true
    }) as Engine<HTMLEvents & ScriptEvents>;
};

const mockContext = () => {
    const engine = mockEngine();
    const tsParser = new TypeScriptParser(engine);
    const jsxParser = new JSXParser(engine);

    return { engine, jsxParser, tsParser };
};

const parseTSX = (content: string) => {
    const { engine } = mockContext();

    return emitFetchEndTSX(engine, content);
};

const walkCallExpressions = async (content: string) => {
    const { engine } = mockContext();
    const nodes: CallExpression[] = [];

    engine.on('parse::end::javascript', ({ ast, walk }) => {
        walk.simple(ast, {
            CallExpression(n) {
                nodes.push(n);
            }
        });
    });

    await engine.emitAsync('fetch::end::unknown', {
        resource: 'https://webhint.io/test.ts',
        response: {
            body: { content },
            mediaType: 'application/x-typescript'
        }
    } as FetchEnd);

    return nodes;
};

test('It can parse and skip types to walk ESTree AST nodes', async (t) => {
    const nodes = await walkCallExpressions(`
        type Foo = { bar: string };
        const circle: Element = document.createElement('circle');
    `);

    t.is(nodes.length, 1);
    t.is(getPropertyName(nodes[0]), 'createElement');
});

test('It can walk ClassProperty instances', async (t) => {
    const nodes = await walkCallExpressions(`
        class Foo {
            public foo: string;
            public bar = () => {
                const circle = document.createElement('circle');
            }
        }
    `);

    t.is(nodes.length, 1);
    t.is(getPropertyName(nodes[0]), 'createElement');
});

test('It can parse JSX content within TSX files', async (t) => {
    const { document } = await parseTSX(`
        type Props = {
            type: string;
        };
        const Button = ({ type }: Props) => {
            return <button id="test" type={type}>Click Here</button>;
        };
    `);

    const button = document.querySelectorAll('button')[0];

    t.is(button.getAttribute('id'), 'test');
    t.false(button.isAttributeAnExpression('id'));
    t.true(button.isAttributeAnExpression('type'));
    t.is(button.innerHTML, 'Click Here');
});

test('All node types are known', (t) => {
    const knownNodeTypes = [
        'BigIntLiteral',
        'ClassProperty',
        'Decorator',
        'ExportSpecifier',
        'Import'
    ];

    for (const type of Object.keys(AST_NODE_TYPES)) {
        const isKnown = type in base || type.startsWith('TS') || knownNodeTypes.includes(type);

        if (!isKnown) {
            t.log(type);
        }

        t.true(isKnown);
    }
});
