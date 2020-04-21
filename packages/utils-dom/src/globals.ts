import { CSSStyleDeclaration } from './cssstyledeclaration';
import { HTMLDocument } from './htmldocument';
import { HTMLElement } from './htmlelement';
import { HTMLBodyElement } from './elements/htmlbodyelement';
import { HTMLHtmlElement } from './elements/htmlhtmlelement';
import { Node } from './node';

const getComputedStyle = (element: HTMLElement) => {
    return element.getComputedStyle();
};

/**
 * Inject DOM APIs into the provided global context.
 * Can be used to establish a basic DOM inside a web worker.
 *
 * @param context The global context to add types, instances, and methods to.
 * @param document The top-level document to assign to the global context.
 */
export const populateGlobals = (context: any, document: HTMLDocument) => {
    document.defaultView = context;

    const globals = {
        CSSStyleDeclaration,
        document,
        Document: HTMLDocument,
        Element: HTMLElement,
        getComputedStyle,
        HTMLBodyElement,
        HTMLDocument,
        HTMLElement,
        HTMLHtmlElement,
        NamedNodeMap: Array,
        Node,
        self: context,
        top: context,
        window: context
    };

    for (const global of Object.keys(globals) as Array<keyof typeof globals>) {
        try {
            context[global] = globals[global];
        } catch (e) {
            // Some globals can't be overridden if present (e.g. `self` in workers).
        }
    }

    return context;
};
