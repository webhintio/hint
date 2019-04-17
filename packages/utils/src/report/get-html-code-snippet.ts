import { HTMLElement } from '../dom/html';

const getOpening = (html: string) => {
    const openingTagRegex = /<([^>]+)>/gi;

    const exec = openingTagRegex.exec(html);

    if (!exec) {
        return html;
    }

    return exec[0];
};

/**
 * Generate a Snippet code for a HTMLElement.
 * @param {HTMLElement} element - HTMLElement to generate the code snippet.
 * @param {number} threshold - Max number of charaters in the result.
 */
export const getHTMLCodeSnippet = (element: HTMLElement, threshold = 100) => {
    const outerHTML = element.outerHTML;

    if (outerHTML.length <= threshold) {
        return outerHTML;
    }

    return getOpening(outerHTML);
};
