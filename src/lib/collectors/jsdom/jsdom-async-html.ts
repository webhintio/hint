import { IAsyncHTMLDocument, IAsyncHTMLElement } from '../../types'; //eslint-disable-line

/** An implementation of AsyncHTMLDocument on top of JSDDOM */
export class JSDOMAsyncHTMLDocument implements IAsyncHTMLDocument {
    private _document: HTMLDocument

    constructor(document: HTMLDocument) {
        this._document = document;
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    querySelectorAll(selector: string): Promise<Array<JSDOMAsyncHTMLElement>> {
        const elements = Array.prototype.slice.call(this._document.querySelectorAll(selector))
            .map((element) => {
                return new JSDOMAsyncHTMLElement(element); // eslint-disable-line no-use-before-define
            });

        return Promise.resolve(elements);
    }

    pageHTML(): Promise<string> {
        return Promise.resolve(this._document.children[0].outerHTML);
    }
}

/** An implementation of AsyncHTMLElement on top of JSDOM */
export class JSDOMAsyncHTMLElement implements IAsyncHTMLElement {
    protected _htmlelement: HTMLElement;
    private _ownerDocument: IAsyncHTMLDocument;

    constructor(htmlelement: HTMLElement) {
        this._htmlelement = htmlelement;
        this._ownerDocument = new JSDOMAsyncHTMLDocument(htmlelement.ownerDocument);
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    getAttribute(name: string): string {
        return this._htmlelement.getAttribute(name);
    }

    isSame(element: JSDOMAsyncHTMLElement): boolean {
        return this._htmlelement === element._htmlelement;
    }

    outerHTML(): Promise<string> {
        return Promise.resolve(this._htmlelement.outerHTML);
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    get attributes(): NamedNodeMap {
        return this._htmlelement.attributes;
    }

    get nodeName(): string {
        return this._htmlelement.nodeName;
    }

    get ownerDocument(): IAsyncHTMLDocument {
        return this._ownerDocument;
    }
}
