import * as eslint from 'eslint';
import * as espree from 'espree';

import { determineMediaTypeForScript } from '../../utils/content-type';
import { IAsyncHTMLElement, IElementFound, IFetchEnd, IScriptParse, Parser } from '../../types';
import { Sonarwhal } from '../../sonarwhal';

const scriptContentRegex: RegExp = /^<script[^>]*>([\s\S]*)<\/script>$/;
// This is the default configuration in eslint for espree.
const defaultParserOptions = {
    comment: true,
    ecmaVersion: 8,
    loc: true,
    range: true,
    tokens: true
};

export default class JavascriptParser extends Parser {
    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);

        sonarwhal.on('fetch::end::script', this.parseJavascript.bind(this));
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

    private async parseJavascript(fetchEnd: IFetchEnd) {
        if (fetchEnd.response.mediaType !== 'text/javascript') {
            return;
        }

        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;

        await this.emitScript(code, resource);
    }

    private hasSrcAttribute(element: IAsyncHTMLElement) {
        const src = element.getAttribute('src');

        return !!src;
    }


    private isJavaScriptType(element: IAsyncHTMLElement) {
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

        if (this.hasSrcAttribute(element)) {
            // Ignore because this will be (or have been) processed in the event 'fetch::end::script'.
            return;
        }

        if (!this.isJavaScriptType(element)) {
            // Ignore if it is not javascript.
            return;
        }

        const code = this.getScriptContent(await element.outerHTML());
        const resource: string = 'Internal javascript';

        await this.emitScript(code, resource);
    }
}
