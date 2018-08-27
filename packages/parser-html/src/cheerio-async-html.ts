import { IAsyncHTMLDocument, IAsyncHTMLElement } from 'hint/dist/src/lib/types/async-html';

/** An implementation of AsyncHTMLElement on top of cheerio */
export class CheerioAsyncHTMLElement implements IAsyncHTMLElement {

    private _element: CheerioElement;
    private _document: CheerioAsyncHTMLDocument; // eslint-disable-line no-use-before-define

    public constructor(_element: CheerioElement, _document: CheerioAsyncHTMLDocument) {
        this._element = _element;
        this._document = _document;
    }

    public get attributes() {
        const attribs = this._element.attribs;

        return Object.keys(attribs).map((name) => {
            return {
                name,
                value: attribs[name]
            };
        });
    }

    public get nodeName(): string {
        return this._element.tagName;
    }

    public get ownerDocument(): IAsyncHTMLDocument {
        return this._document;
    }

    public getAttribute(name: string): string {
        return this._element.attribs[name];
    }

    public isSame(element: CheerioAsyncHTMLElement): boolean {
        return this._element === element._element;
    }

    public outerHTML(): Promise<string> {
        const $ = this._document.$;

        return Promise.resolve($.html($(this._element)));
    }
}

/** An implementation of AsyncHTMLDocument on top of cheerio */
export class CheerioAsyncHTMLDocument implements IAsyncHTMLDocument {
    public $: CheerioStatic;

    public constructor($: CheerioStatic) {
        this.$ = $;
    }

    public querySelectorAll(selector: string): Promise<Array<CheerioAsyncHTMLElement>> {

        const results = Array.from(this.$(selector));
        const elements = results.map((element) => {
            return new CheerioAsyncHTMLElement(element, this);
        });

        return Promise.resolve(elements);
    }

    public pageHTML(): Promise<string> {
        return Promise.resolve(this.$.html());
    }
}
