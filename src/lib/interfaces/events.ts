import { IAsyncHTMLElement } from './asynchtml';

/** The object emited by a collector on `fetch::end` */
export interface IFetchEndEvent {
    /** The uri of the resource firing this event */
    resource: string;
    /** The HTMLElement that started the fetch */
    element: HTMLElement;
    /** The content of target in the url or href of element */
    content: string;
    /** The headers of the response */
    headers: object;
}

/** The object emited by a collector on `element::TYPEOFELEMENT` */
export interface IElementFoundEvent {
    /** The uri of the resource firing this event */
    resource: string;
    /** The HTMLElement found */
    element: IAsyncHTMLElement;
}
