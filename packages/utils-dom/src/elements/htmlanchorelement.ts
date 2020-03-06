import { ElementData } from '../types';
import { HTMLElement } from '../htmlelement';
import { HTMLDocument } from '../htmldocument';

/**
 * https://developer.mozilla.org/docs/Web/API/HTMLAnchorElement
 */
export class HTMLAnchorElement extends HTMLElement {
    private _href = '';
    private _url: URL;

    /**
     * Non-standard. Used internally by utils-dom to create HTMLAnchorElement instances.
     */
    public constructor(element: ElementData, ownerDocument: HTMLDocument) {
        super(element, ownerDocument);
        this._url = new URL('', ownerDocument.base);
    }

    private _getURL() {
        const href = this.getAttribute('href') || '';

        if (this._href !== href) {
            try {
                this._href = href;
                this._url = new URL(this._href, this.ownerDocument.base);
            } catch (e) {
                this._url = new URL('', this.ownerDocument.base);
            }
        }

        return this._url;
    }

    public get href() {
        return this._getURL().href;
    }

    public get protocol () {
        return this._getURL().protocol;
    }

    public get host() {
        return this._getURL().host;
    }

    public get search() {
        return this._getURL().search;
    }

    public get hash() {
        return this._getURL().hash;
    }

    public get hostname() {
        return this._getURL().hostname;
    }

    public get port() {
        return this._getURL().port;
    }

    public get pathname() {
        return this._getURL().pathname;
    }
}
