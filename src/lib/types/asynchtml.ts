export interface IAsyncHTMLAttribute {
    /** Attribute name of the element */
    name: string;

    /** Attribute value of the element */
    value: string;
}

/** A wrapper of an HTMLElement that gives access to the required resources
  * asynchronously to be compatible with all collectors */
export interface IAsyncHTMLElement {
    /** The attributes of the element */
    readonly attributes: Array<IAsyncHTMLAttribute> | NamedNodeMap;
    /** Returns the value for a given attribute */
    getAttribute(attribute: string): string;
    /** Checks if two AsyncHTMLElements are the same */
    isSame(element: IAsyncHTMLElement): boolean;
    /** Returns the outerHTML of the element */
    outerHTML(): Promise<string>;
    /** Returns the document where the element lives */
    readonly ownerDocument: IAsyncHTMLDocument;
    /** The nodeName of the element */
    readonly nodeName: string
}

export interface IAsyncHTMLDocument {
    /** A wrapper around querySelectorAll that returns an Array of AsyncHTMLElements instead of a NodeList */
    querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>>
    /** The HTML of the page as returned by document.children[0].outerHTML or similar */
    pageHTML(): Promise<string>;
}
