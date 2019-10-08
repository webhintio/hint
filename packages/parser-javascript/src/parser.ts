import { Options, Parser } from 'acorn';
import { Node } from 'estree-jsx';

import { debug as d } from '@hint/utils/dist/src/debug';
import { HTMLElement } from '@hint/utils/dist/src/dom';
import { determineMediaTypeForScript } from '@hint/utils/dist/src/content-type';
import { ElementFound, FetchEnd, Parser as WebhintParser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';

import { ScriptEvents } from './types';
import { combineWalk } from './walk';

export * from './types';

const debug = d(__filename);
const jsx = require('acorn-jsx');
const jsParser = Parser.extend();
const jsxParser = jsx ? Parser.extend(jsx()) : Parser.extend();

export default class JavascriptParser extends WebhintParser<ScriptEvents> {
    public constructor(engine: Engine<ScriptEvents>) {
        super(engine, 'javascript');

        engine.on('fetch::end::script', this.parseJavascript.bind(this));
        engine.on('fetch::end::unknown', this.onFetchUnknown.bind(this));
        engine.on('element::script', this.parseJavascriptTag.bind(this));
    }

    private async emitScript(parser: typeof Parser, sourceCode: string, resource: string, element: HTMLElement | null) {
        try {
            await this.engine.emitAsync(`parse::start::javascript`, { resource });

            const options: Options = { locations: true, ranges: true };
            const ast = parser.parse(sourceCode, options) as Node;
            const tokens = [...parser.tokenizer(sourceCode, options)];

            await combineWalk(async (walk) => {
                await this.engine.emitAsync(`parse::end::javascript`, {
                    ast,
                    element,
                    resource,
                    sourceCode,
                    tokens,
                    walk
                });
            });

        } catch (err) {
            debug(`Error parsing JS code (${err}): ${sourceCode}`);
        }
    }

    private async onFetchUnknown(fetchEnd: FetchEnd) {
        if (fetchEnd.response.mediaType !== 'text/jsx') {
            return;
        }

        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;

        await this.emitScript(jsxParser, code, resource, null);
    }

    private async parseJavascript(fetchEnd: FetchEnd) {
        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;

        await this.emitScript(jsParser, code, resource, null);
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

        await this.emitScript(jsParser, element.innerHTML, resource, element);
    }
}
