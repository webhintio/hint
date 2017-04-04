import { IAsyncHTMLDocument, IAsyncHTMLElement } from '../../interfaces'; //eslint-disable-line

/** An implementation of AsyncHTMLDocument on top of JSDDOM */
export class JSDOMAsyncHTMLDocument implements IAsyncHTMLDocument {
    private _document: HTMLDocument

    constructor(document: HTMLDocument) {
        this._document = document;
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    querySelectorAll(selector: string) {
        const elements = Array.prototype.slice.call(this._document.querySelectorAll(selector))
            .map((element) => {
                return new JSDOMAsyncHTMLElement(element); // eslint-disable-line no-use-before-define
            });

        return Promise.resolve(elements);
    }

    pageHTML() {
        return Promise.resolve(this._document.children[0].outerHTML);
    }
}

/** An implementation of AsyncHTMLElement on top of JSDOM */
export class JSDOMAsyncHTMLElement implements IAsyncHTMLElement {
    protected _htmlelement: HTMLElement;
    private _ownerDocument: IAsyncHTMLDocument;

    constructor(htmlelement) {
        this._htmlelement = htmlelement;
        this._ownerDocument = new JSDOMAsyncHTMLDocument(htmlelement.ownerDocument);
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    getAttribute(name: string) {
        return this._htmlelement.getAttribute(name);
    }

    isSame(element: JSDOMAsyncHTMLElement) {
        return this._htmlelement === element._htmlelement;
    }

    outerHTML() {
        return Promise.resolve(this._htmlelement.outerHTML);
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    get attributes() {
        return this._htmlelement.attributes;
    }

    get nodeName() {
        return this._htmlelement.nodeName;
    }

    get ownerDocument() {
        return this._ownerDocument;
    }
}
