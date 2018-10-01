import { ProblemLocation } from './problems';

export type AsyncHTMLAttribute = {
    /** Attribute name of the element */
    name: string;

    /** Attribute value of the element */
    value: string;
};

export interface IAsyncNamedNodeMap {
    [index: number]: AsyncHTMLAttribute;
    item?(index: number): AsyncHTMLAttribute | null;
    readonly length: number;
}

/**
 * A wrapper of an HTMLElement that gives access to the required resources
 * asynchronously to be compatible with all connectors
 */
export interface IAsyncHTMLElement {
    /** The attributes of the element */
    readonly attributes: IAsyncNamedNodeMap;
    /** Returns the value for a given attribute */
    getAttribute(attribute: string): string | null;
    /** Returns the location of this element in source (or null) */
    getLocation(): ProblemLocation | null;
    /** Checks if two AsyncHTMLElements are the same */
    isSame(element: IAsyncHTMLElement): boolean;
    /** Returns the outerHTML of the element */
    outerHTML(): Promise<string>;
    /** Returns the document where the element lives */
    readonly ownerDocument: IAsyncHTMLDocument;
    /** The nodeName of the element */
    readonly nodeName: string;
}

export interface IAsyncHTMLDocument {
    /** A wrapper around querySelectorAll that returns an Array of AsyncHTMLElements instead of a NodeList */
    querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>>;
    /** The HTML of the page as returned by document.children[0].outerHTML or similar */
    pageHTML(): Promise<string>;
}

export interface IAsyncWindow {
    /** Returns the document associated with this window */
    readonly document: IAsyncHTMLDocument;
    /** Run the provided JavaScript in the context of this window */
    evaluate(source: string): Promise<any>;
}
