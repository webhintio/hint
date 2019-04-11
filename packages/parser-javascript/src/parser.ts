import { Options, parse, tokenizer } from 'acorn';
import * as walk from 'acorn-walk';
import * as ESTree from 'estree';

import { HTMLElement } from '@hint/utils/dist/src/dom/html';
import * as logger from '@hint/utils/dist/src/logging';
import { determineMediaTypeForScript } from 'hint/dist/src/lib/utils/content-type';
import { ElementFound, FetchEnd, Parser as WebhintParser } from 'hint/dist/src/lib/types';
import { ScriptEvents } from './types';
import { Engine } from 'hint/dist/src/lib/engine';

export * from './types';

export default class JavascriptParser extends WebhintParser<ScriptEvents> {
    public constructor(engine: Engine<ScriptEvents>) {
        super(engine, 'javascript');

        engine.on('fetch::end::script', this.parseJavascript.bind(this));
        engine.on('element::script', this.parseJavascriptTag.bind(this));
    }

    private async emitScript(sourceCode: string, resource: string, element: HTMLElement | null) {
        try {
            await this.engine.emitAsync(`parse::start::javascript`, { resource });

            const options: Options = { locations: true };
            const ast = parse(sourceCode, options) as ESTree.Node;
            const tokens = [...tokenizer(sourceCode, options)];

            await this.engine.emitAsync(`parse::end::javascript`, {
                ast,
                element,
                resource,
                sourceCode,
                tokens,
                walk
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
