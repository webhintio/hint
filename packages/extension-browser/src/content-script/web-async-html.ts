import {
    IAsyncHTMLElement,
    IAsyncHTMLDocument,
    IAsyncNamedNodeMap,
    IAsyncWindow
} from 'hint/src/lib/types';

import { eval } from '../shared/globals';

export class AsyncHTMLElement implements IAsyncHTMLElement {
    public ownerDocument: IAsyncHTMLDocument;

    private _element: Element;

    public constructor(element: Element, ownerDocument: IAsyncHTMLDocument) {
        this._element = element;
        this.ownerDocument = ownerDocument;
    }

    public get attributes(): IAsyncNamedNodeMap {
        return this._element.attributes;
    }

    public get nodeName(): string {
        return this._element.nodeName;
    }

    public getAttribute(attribute: string): string | null {
        return this._element.getAttribute(attribute);
    }

    public getLocation(): null {
        return null;
    }

    public isSame(element: AsyncHTMLElement): boolean {
        return this._element === element._element;
    }

    public outerHTML(): Promise<string> {
        return Promise.resolve(this._element.outerHTML);
    }
}

export class AsyncHTMLDocument implements IAsyncHTMLDocument {

    private _document: Document;
    private _pageHTML = '';

    public constructor(document: Document) {
        this._document = document;
    }

    public pageHTML(): Promise<string> {
        return Promise.resolve(this._pageHTML);
    }

    public setPageHTML(pageHTML: string) {
        this._pageHTML = pageHTML;
    }

    public querySelectorAll(selector: string): Promise<IAsyncHTMLElement[]> {
        const matches = Array.from(this._document.querySelectorAll(selector));

        const result = matches.map((element) => {
            return new AsyncHTMLElement(element, this);
        });

        return Promise.resolve(result);
    }
}

export class AsyncWindow implements IAsyncWindow {
    public document: IAsyncHTMLDocument;

    public constructor(document: AsyncHTMLDocument) {
        this.document = document;
    }

    public evaluate(source: string): Promise<any> {
        return Promise.resolve(eval(source)); // eslint-disable-line
    }
}
