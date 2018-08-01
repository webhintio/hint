import * as postcss from 'postcss';

import * as logger from 'hint/dist/src/lib/utils/logging';
import { IAsyncHTMLElement, ElementFound, FetchEnd, Parser } from 'hint/dist/src/lib/types';
import { StyleParse } from './types';
import { Engine } from 'hint/dist/src/lib/engine';

const styleContentRegex: RegExp = /^<style[^>]*>([\s\S]*)<\/style>$/;

export default class CSSParser extends Parser {
    public constructor(engine: Engine) {
        super(engine, 'css');

        engine.on('fetch::end::css', this.parseCSS.bind(this));
        engine.on('element::style', this.parseStyleTag.bind(this));
    }

    private async emitCSS(code: string, resource: string) {

        try {
            const ast = postcss.parse(code, { from: resource });

            const styleData: StyleParse = {
                ast,
                code,
                resource
            };

            await this.engine.emitAsync(`parse::${this.name}::end`, styleData);

        } catch (err) {
            logger.error(`Error parsing code: ${code} - ${err}`);
        }
    }

    private async parseCSS(fetchEnd: FetchEnd) {
        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;

        await this.emitCSS(code, resource);
    }

    private isCSSType(element: IAsyncHTMLElement) {
        const type = element.getAttribute('type');

        return !type || type === 'text/css';
    }

    private getStyleContent(styleTagText) {
        const match = styleTagText.match(styleContentRegex);

        return match[1].trim();
    }

    private async parseStyleTag(elementFound: ElementFound) {
        const element: IAsyncHTMLElement = elementFound.element;

        if (!this.isCSSType(element)) {
            // Ignore if it is not CSS.
            return;
        }

        const code = this.getStyleContent(await element.outerHTML());
        const resource: string = 'Inline CSS';

        await this.emitCSS(code, resource);
    }
}
