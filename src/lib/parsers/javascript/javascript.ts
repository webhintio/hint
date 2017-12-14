import * as eslint from 'eslint';
import * as espree from 'espree';

import { determineMediaTypeForScript } from '../../utils/content-type';
import { IAsyncHTMLElement, IElementFound, IFetchEnd, IScriptParse, Parser } from '../../types';
import { Sonarwhal } from '../../sonarwhal';

const scriptContentRegex: RegExp = /^<script[^>]*>([\s\S]*)<\/script>$/;
const defaultParserOptions = {
    loc: true,
    range: true,
    tokens: true,
    comment: true,
    ecmaVersion: 8
};

export default class JavascriptParser extends Parser {
    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);

        sonarwhal.on('fetch::end', this.parseJavascript.bind(this));
        sonarwhal.on('element::script', this.parseJavascriptTag.bind(this));
    }

    private async emitScript(code: string, resource: string) {
        const ast = espree.parse(code, defaultParserOptions);

        const scriptData: IScriptParse = {
            resource,
            sourceCode: new eslint.SourceCode(code, ast)
        };

        await this.sonarwhal.emitAsync('parse::javascript', scriptData);
    }

    private parseJavascript(fetchEnd: IFetchEnd) {
        if (fetchEnd.response.mediaType !== 'text/javascript') {
            return;
        }

        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;

        return this.emitScript(code, resource);
    }

    private isSrcPresent(element: IAsyncHTMLElement) {
        const src = element.getAttribute('src');

        return !!src;
    }


    private isJavascript(element: IAsyncHTMLElement) {
        const type = determineMediaTypeForScript(element);

        return !!type;
    }

    private getScriptContent(scriptTagText) {
        const match = scriptTagText.match(scriptContentRegex);

        if (!match) {
            // QUESTION: throw an exception?
            return '';
        }

        return match[1].trim();
    }

    private async parseJavascriptTag(elementFound: IElementFound) {
        const element: IAsyncHTMLElement = elementFound.element;

        if (this.isSrcPresent(element)) {
            // Ignore because this will be processed in the event 'fetch::end'.
            return;
        }

        if (!this.isJavascript(element)) {
            // Ignore if it is not a javascript.
            return;
        }

        const code = this.getScriptContent(await element.outerHTML());
        const resource: string = 'Internal javascript';

        return this.emitScript(code, resource);
    }
}