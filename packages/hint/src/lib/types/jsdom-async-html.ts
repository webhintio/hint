import { IAsyncHTMLDocument, IAsyncHTMLElement, IAsyncWindow } from './async-html';
import { DOMWindow, JSDOM } from 'jsdom';
import { ProblemLocation } from './problems';

/** An implementation of AsyncHTMLDocument on top of JSDDOM */
export class JSDOMAsyncHTMLDocument implements IAsyncHTMLDocument {
    private _document: HTMLDocument;
    private _dom: JSDOM;

    public constructor(document: HTMLDocument, dom?: JSDOM) {
        this._document = document;
        this._dom = dom;
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
                    return new JSDOMAsyncHTMLElement(element, this._dom); // eslint-disable-line no-use-before-define, typescript/no-use-before-define
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
    private _dom: JSDOM;
    protected _htmlelement: HTMLElement;
    private _ownerDocument: IAsyncHTMLDocument;

    public constructor(htmlelement: HTMLElement, dom?: JSDOM) {
        this._dom = dom;
        this._htmlelement = htmlelement;
        this._ownerDocument = new JSDOMAsyncHTMLDocument(htmlelement.ownerDocument, this._dom);
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
    public getLocation(): ProblemLocation {
        try {
            /*
             * TODO: Depending on the install (yarn vs npm) we get a different version of `jsdom`
             * that has a different version of `parse5`. This takes care of this issue but should
             * be fixed once we migrate completely to jsdom 12 (https://github.com/webhintio/hint/pull/1274)
             */
            const location = this._dom && this._dom.nodeLocation(this._htmlelement);

            return location && {
                column: location.startTag.col || (location.startTag as any).startCol,
                line: (location.startTag.line || (location.startTag as any).startLine) - 1
            } || null;
        } catch (e) {
            // JSDOM throws an exception if `includeNodeLocations` wasn't set.
            return null;
        }
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
    // TODO: Add type `DOMWindow` once @types/jsdom supports v12
    private _window: any;
    private _document: JSDOMAsyncHTMLDocument;
    private _dom: JSDOM;

    public constructor(window: DOMWindow, dom?: JSDOM) {
        this._dom = dom;
        this._window = window;
        this._document = new JSDOMAsyncHTMLDocument(window.document, this._dom);
    }

    public get document(): IAsyncHTMLDocument {
        return this._document;
    }

    public evaluate(source: string): Promise<any> {
        return this._window.eval(source) as any;
    }
}
