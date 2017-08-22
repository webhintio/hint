import { IAsyncHTMLDocument, IAsyncHTMLElement } from '../../types'; //eslint-disable-line

/** An implementation of AsyncHTMLDocument on top of the Chrome Debugging Protocol */
export class AsyncHTMLDocument implements IAsyncHTMLDocument {
    /** The DOM domain of the CDP client */
    private _DOM;
    /** The root element of the real DOM */
    private _dom;
    /** A map with all the nodes accessible using `nodeId` */
    private _nodes: Map<number, any> = new Map();

    public constructor(DOM) {
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

    private getHTMLChilden(children: Array<any>) {
        return children.find((item) => {
            return item.nodeType === 1 && item.nodeName === 'HTML';
        });
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    public async querySelectorAll(selector: string): Promise<Array<AsyncHTMLElement>> {
        let nodeIds;

        try {
            nodeIds = (await this._DOM.querySelectorAll({ nodeId: this._dom.nodeId, selector })).nodeIds;
        } catch (e) {
            return [];
        }

        return nodeIds.map((nodeId) => {
            return new AsyncHTMLElement(this._nodes.get(nodeId), this, this._DOM); // eslint-disable-line no-use-before-define, typescript/no-use-before-define
        });
    }

    public async pageHTML(): Promise<string> {
        let { outerHTML } = await this._DOM.getOuterHTML({ nodeId: this._dom.nodeId });

        // Some browsers like Edge don't have the property outerHTML in the root element
        // so we need to find the html element
        if (!outerHTML) {
            const htmlElement = this.getHTMLChilden(this._dom.children);

            ({ outerHTML } = await this._DOM.getOuterHTML({ nodeId: htmlElement.nodeId }));
        }

        return outerHTML;
    }

    public async load() {
        const { root: dom } = await this._DOM.getDocument({ depth: -1 });

        this.trackNodes(dom);
        this._dom = dom;
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    public get root() {
        return this._dom;
    }
}

/** An implementation of AsyncHTMLElement on top of the Chrome Debugging Protocol */
export class AsyncHTMLElement implements IAsyncHTMLElement {
    protected _htmlelement;
    private _ownerDocument: IAsyncHTMLDocument;
    private _DOM;
    private _attributesArray: Array<{ name: string; value: string; }> = [];
    private _attributesMap: Map<string, string> = new Map();

    public constructor(htmlelement, ownerDocument, DOM) {
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

    public getAttribute(name: string): string {
        if (this._attributesArray.length === 0) {
            this.initializeAttributes();
        }

        const value = this._attributesMap.get(name);

        return typeof value === 'string' ? value : null;
    }

    public isSame(element: AsyncHTMLElement): boolean {
        return this._htmlelement.nodeId === element._htmlelement.nodeId;
    }

    public async outerHTML(): Promise<string> {
        const { outerHTML } = await this._DOM.getOuterHTML({ nodeId: this._htmlelement.nodeId });

        return outerHTML;
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    public get attributes() {
        if (this._attributesArray.length === 0) {
            this.initializeAttributes();
        }

        return this._attributesArray;
    }

    public get children() {
        if (this._htmlelement.children) {
            return this._htmlelement.children;
        }

        return [];
    }

    public get nodeName(): string {
        return this._htmlelement.nodeName;
    }

    public get ownerDocument(): IAsyncHTMLDocument {
        return this._ownerDocument;
    }
}
