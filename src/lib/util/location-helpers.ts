import * as d from 'debug';
const debug = d('sonar:util:problem-location');

import { IAsyncHTMLElement, IProblemLocation } from './../interfaces'; // eslint-disable-line no-unused-vars

/**
 * Creates a CSS selector from a given element using its attributes and the type of node:
 *
 * Ex.: <a href="www.wikipedia.org"></a> --> 'a[href="www.wikipedia.org"]'
 */
const selectorFromElement = (element: IAsyncHTMLElement): string => {
    let selector = `${element.nodeName.toLowerCase()}`;

    const attributes = element.attributes;

    // attributes doesn't have the Symbol.Iterator();
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];

        selector += `[${attribute.name}="${attribute.value}"]`;
    }

    debug(`Selector created: ${selector}`);

    return selector;
};

/**
 * Finds all the indices of a string into another
 *
 * Original code: http://stackoverflow.com/a/3410557/414145
 */
const getIndicesOf = (searchStr: string, str: string): Array<number> => {
    const searchStrLen = searchStr.length;

    let startIndex = 0, index;
    const indices = [];

    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }

    debug(`Indices found: ${indices.length} (${JSON.stringify(indices)})`);

    return indices;
};

/** Finds the Location of an HTMLElement in the document */
export const findElementLocation = async (element: IAsyncHTMLElement): Promise<IProblemLocation | null> => {
    const html = await element.ownerDocument.pageHTML();
    const elementHTML = await element.outerHTML();
    const indexOccurences = getIndicesOf(elementHTML, html);
    const selector = selectorFromElement(element);
    const elements = await element.ownerDocument.querySelectorAll(selector);

    let similarItems = 0;

    // We found the exact number of occurrences so we can access the right index
    for (let index = 0; index < elements.length; index++) {
        const currentElement = elements[index];

        /* We compare the HTML because the selector might not be enough to distinguish:
            <a href="http://site1">Site1</a>
            <a href="http://site1">Site2</a>
        */
        const currentElementHTML = await currentElement.outerHTML();

        if (currentElementHTML === elementHTML) {
            similarItems++;
            if (element.isSame(currentElement)) {
                break;
            }
        }
    }

    const htmlBeforeElement = html.substring(0, indexOccurences[similarItems - 1]);

    const lines = htmlBeforeElement.split('\n');
    const line = lines.length;
    const column = lines.pop().length;

    return {
        column,
        line
    };
};

/** Returns the first location (line/column) where `content` appears.
 * * If no content is provided, the return value is {0, 0}
 * * If the content is not found, the return value is {-1, -1}
  */
export const findInElement = async (element: IAsyncHTMLElement, content?: string): Promise<IProblemLocation> => {
    if (!content) {
        return {
            column: 0,
            line: 0
        };
    }

    const outerHTML = await element.outerHTML();

    const startIndex = outerHTML.indexOf(content);

    if (startIndex === -1) {
        return {
            column: -1,
            line: -1
        };
    }

    const html = outerHTML.substring(0, startIndex);
    const lines = html.split('\n');
    const line = lines.length;

    // `startIndex + 1` because `indexOf` starts from `0`.
    const column = lines.length === 1 ? startIndex + 1 : lines.pop().length;

    return {
        column,
        line
    };
};

/** Returns the real location of a problem in the given HTML */
export const findProblemLocation = async (element: IAsyncHTMLElement, offset: IProblemLocation, content?: string): Promise<IProblemLocation> => {
    const elementLocation = await findElementLocation(element);
    const problemLocation = await findInElement(element, content);

    if (problemLocation.line === 1) {
        return {
            column: problemLocation.column + elementLocation.column + offset.column,
            line: elementLocation.line + offset.line
        };
    } else if (problemLocation.line > 1) {
        problemLocation.line--; // problem location starts at 1 which is the same line where element is found
    }

    return {
        column: (problemLocation.column || elementLocation.column) + offset.column, // offset.column should usually be 0
        line: elementLocation.line + problemLocation.line + offset.line
    };
};
