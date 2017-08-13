import { IAsyncHTMLDocument, IAsyncHTMLElement } from '../../types'; //eslint-disable-line

/** An implementation of AsyncHTMLDocument on top of JSDDOM */
export class JSDOMAsyncHTMLDocument implements IAsyncHTMLDocument {
    private _document: HTMLDocument

    public constructor(document: HTMLDocument) {
        this._document = document;
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    public querySelectorAll(selector: string): Promise<Array<JSDOMAsyncHTMLElement>> {
        const elements = Array.prototype.slice.call(this._document.querySelectorAll(selector))
            .map((element) => {
                return new JSDOMAsyncHTMLElement(element); // eslint-disable-line no-use-before-define, typescript/no-use-before-define
            });

        return Promise.resolve(elements);
    }

    public pageHTML(): Promise<string> {
        return Promise.resolve(this._document.children[0].outerHTML);
    }
}

/** An implementation of AsyncHTMLElement on top of JSDOM */
export class JSDOMAsyncHTMLElement implements IAsyncHTMLElement {
    protected _htmlelement: HTMLElement;
    private _ownerDocument: IAsyncHTMLDocument;

    public constructor(htmlelement: HTMLElement) {
        this._htmlelement = htmlelement;
        this._ownerDocument = new JSDOMAsyncHTMLDocument(htmlelement.ownerDocument);
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    public getAttribute(name: string): string {
        return this._htmlelement.getAttribute(name);
    }

    public isSame(element: JSDOMAsyncHTMLElement): boolean {
        return this._htmlelement === element._htmlelement;
    }

    public outerHTML(): Promise<string> {
        return Promise.resolve(this._htmlelement.outerHTML);
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    public get attributes(): NamedNodeMap {
        return this._htmlelement.attributes;
    }

    public get nodeName(): string {
        return this._htmlelement.nodeName;
    }

    public get ownerDocument(): IAsyncHTMLDocument {
        return this._ownerDocument;
    }
}
