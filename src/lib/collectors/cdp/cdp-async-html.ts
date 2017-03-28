import { AsyncHTMLDocument, AsyncHTMLElement } from '../../types'; //eslint-disable-line

/** An implementation of AsyncHTMLDocument on top of the Chrome Debugging Protocol */
export class CDPAsyncHTMLDocument implements AsyncHTMLDocument {
    /** The DOM domain of the CDP client */
    private _DOM;
    /** The root element of the real DOM */
    private _dom;
    /** A map with all the nodes accessible using `nodeId` */
    private _nodes: Map<number, any> = new Map();

    constructor(DOM) {
        this._DOM = DOM;
    }

    /** When doing requests like `querySelectorAll`, we receive an array of nodeIds. Instead
     * of having to do another request for the node, and because we are getting the whole DOM
     * initially, we store them in a Map using the `nodeId` as the key so we can access to them
     * later.
     */
    private trackNodes(root) {
        this._nodes.set(root.nodeId, root);
        if (!root.children) {
            return;
        }

        root.children.forEach((child) => {
            this.trackNodes(child);
        });
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    async querySelectorAll(selector: string) {
        const { nodeIds } = await this._DOM.querySelectorAll({ nodeId: 1, selector });

        return nodeIds.map((nodeId) => {
            return new CDPAsyncHTMLElement(this._nodes.get(nodeId), this, this._DOM); // eslint-disable-line no-use-before-define
        });
    }

    async pageHTML() {
        const { outerHTML } = await this._DOM.getOuterHTML({ nodeId: this._dom.nodeId });

        return outerHTML;
    }

    async load() {
        const { root: dom } = await this._DOM.getDocument({ depth: -1 });

        this.trackNodes(dom);
        this._dom = dom;
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    get root() {
        return this._dom;
    }
}

/** An implementation of AsyncHTMLElement on top of the Chrome Debugging Protocol */
export class CDPAsyncHTMLElement implements AsyncHTMLElement {
    protected _htmlelement;
    private _ownerDocument: AsyncHTMLDocument;
    private _DOM;
    private _attributesArray: Array<{ name: string, value: string }> = [];
    private _attributesMap: Map<string, string> = new Map();

    constructor(htmlelement, ownerDocument, DOM) {
        if (typeof htmlelement === 'number') {
            throw new Error();
        }
        this._htmlelement = htmlelement;
        this._DOM = DOM;
        this._ownerDocument = ownerDocument;
    }

    private initializeAttributes() {
        const attributes = this._htmlelement.attributes || [];

        for (let i = 0; i < attributes.length; i += 2) {
            this._attributesArray.push({ name: attributes[i], value: attributes[i + 1] });
            this._attributesMap.set(attributes[i], attributes[i + 1]);
        }
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    getAttribute(name: string) {
        if (this._attributesArray.length === 0) {
            this.initializeAttributes();
        }

        return this._attributesMap.get(name);
    }
    isSame(element: CDPAsyncHTMLElement) {
        return this._htmlelement.nodeId === element._htmlelement.nodeId;
    }
    async outerHTML() {
        const { outerHTML } = await this._DOM.getOuterHTML({ nodeId: this._htmlelement.nodeId });

        return outerHTML;
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    get attributes() {
        if (this._attributesArray.length === 0) {
            this.initializeAttributes();
        }

        return this._attributesArray;
    }
    get children() {
        if (this._htmlelement.children) {
            return this._htmlelement.children;
        }

        return [];
    }
    get nodeName() {
        return this._htmlelement.nodeName;
    }
    get ownerDocument() {
        return this._ownerDocument;
    }
}
