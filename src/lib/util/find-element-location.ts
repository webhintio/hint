import { ProblemLocation } from './../types'; // eslint-disable-line no-unused-vars

/** Finds the Location of an HTMLElement in the document */
export const findElementLocation = (element: HTMLElement, html: string, inElemContent?: string): ProblemLocation => {

    const occurrences = (html.match(new RegExp(element.outerHTML, 'g')) || []).length;

    let htmlBeforeElement = '';
    let htmlFromElementToEndOfElement = '';

    if (occurrences === 1) {
        htmlBeforeElement = html.substring(0, html.indexOf(element.outerHTML));
    } else if (occurrences > 1) {
        // TODO: return the right start place
        htmlBeforeElement = html.substring(0, html.indexOf(element.outerHTML));
    } else {
        return null;
    }

    const lines = htmlBeforeElement.split('\n');
    let line = lines.length
    let column = lines.pop().length;

    // Try to determine where in the element is inElemContent, and update
    // the column accordingly.
    //
    // e.g.:
    //
    //  If `inElemContent` is `src` and the element is `<script src="...">`,
    //  then `pos` will be `9`:
    //
    //  <script src="...">
    //  |       |
    //  1       9

    if (inElemContent) {
        htmlFromElementToEndOfElement = html.substr(htmlBeforeElement.length, element.outerHTML.length);
        const index = htmlFromElementToEndOfElement.indexOf(inElemContent) + 1;

        if (index > 0) {
            column += index;
        }
    }

    return {
        column: column,
        line: line
    };

};
