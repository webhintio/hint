import { IAsyncHTMLDocument, IAsyncHTMLElement, IAsyncWindow } from './async-html';
import { DOMWindow } from 'jsdom';

/** An implementation of AsyncHTMLDocument on top of JSDDOM */
export class JSDOMAsyncHTMLDocument implements IAsyncHTMLDocument {
    private _document: HTMLDocument

    public constructor(document: HTMLDocument) {
        this._document = document;
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */
    /* istanbul ignore next */
    public querySelectorAll(selector: string): Promise<Array<JSDOMAsyncHTMLElement>> {
        // jsdom's `querySelectorAll` can be a bit fragile (e.g.: fails if attribute name has `.` on it)
        try {
            const elements = Array.prototype.slice.call(this._document.querySelectorAll(selector))
                .map((element) => {
                    return new JSDOMAsyncHTMLElement(element); // eslint-disable-line no-use-before-define, typescript/no-use-before-define
                });

            return Promise.resolve(elements);
        } catch (e) {
            return Promise.resolve([]);
        }
    }

    /* istanbul ignore next */
    public pageHTML(): Promise<string> {
        return Promise.resolve(this._document.documentElement.outerHTML);
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

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public getAttribute(name: string): string {
        return this._htmlelement.getAttribute(name);
    }

    /* istanbul ignore next */
    public isSame(element: JSDOMAsyncHTMLElement): boolean {
        return this._htmlelement === element._htmlelement;
    }

    /* istanbul ignore next */
    public outerHTML(): Promise<string> {
        return Promise.resolve(this._htmlelement.outerHTML);
    }

    /*
     * ------------------------------------------------------------------------------
     * Getters
     * ------------------------------------------------------------------------------
     */

    /* istanbul ignore next */
    public get attributes(): NamedNodeMap {
        return this._htmlelement.attributes;
    }

    public get nodeName(): string {
        return this._htmlelement.nodeName;
    }

    /* istanbul ignore next */
    public get ownerDocument(): IAsyncHTMLDocument {
        return this._ownerDocument;
    }
}

export class JSDOMAsyncWindow implements IAsyncWindow {
    private _window: DOMWindow;
    private _document: JSDOMAsyncHTMLDocument;

    public constructor(window: DOMWindow) {
        this._window = window;
        this._document = new JSDOMAsyncHTMLDocument(window.document);
    }

    public get document(): IAsyncHTMLDocument {
        return this._document;
    }

    public evaluate(source: string): Promise<any> {
        return this._window.eval(source) as any;
    }
}
