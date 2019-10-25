import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Engine, FetchEnd } from 'hint';
import { HTMLEvents, HTMLParse } from '@hint/parser-html';
import { CallExpression, ScriptEvents } from '@hint/parser-javascript';
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

test('It can parse and skip types to walk ESTree AST nodes', async (t) => {
    const content = `type Foo = { bar: string };\nconst circle: Element = document.createElement('circle')`;
    const { engine } = mockContext();

    let res = '';
    let node: CallExpression | undefined;

    engine.on('parse::end::javascript', ({ ast, walk, resource }) => {
        res = resource;

        walk.simple(ast, {
            CallExpression(n) {
                node = n;
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

    const callee = node && node.callee;
    const property = callee && callee.type === 'MemberExpression' && callee.property;
    const propertyName = property && property.type === 'Identifier' && property.name;

    t.is(res, 'https://webhint.io/test.ts');
    t.is(propertyName, 'createElement');
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
