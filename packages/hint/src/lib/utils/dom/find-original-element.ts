import { HTMLDocument, HTMLElement } from '../../types/html';

type Predicate = (element: HTMLElement) => boolean;

/**
 * Find all elements matching the provided query and test in the target document.
 */
const findMatches = (document: HTMLDocument, query: string, test?: Predicate): HTMLElement[] => {
    let matches = document.querySelectorAll(query);

    if (test) {
        matches = matches.filter((match) => {
            return test(match);
        });
    }

    return matches;
};

/**
 * Find the best matching element for the provided query and test in the target document.
 */
const findMatch = (document: HTMLDocument, element: HTMLElement, query: string, test?: Predicate): HTMLElement | null => {
    const matches = findMatches(document, query, test);
    let matchIndex = 0;

    // Handle duplicates by aligning on the nth match across current and original docs.
    if (matches.length > 1 && element.ownerDocument) {
        const ownerMatches = findMatches(element.ownerDocument, query, test);

        matchIndex = ownerMatches.findIndex((match) => {
            return match.isSame(element);
        });
    }

    // Return the nth match if possible, or the first match otherwise.
    return matches[matchIndex] || matches[0] || null;
};

/**
 * Perform a best-effort search to find an element in the provided document
 * which is likely the original source for the provided element. Used to
 * resolve element locations to the original HTML when possible.
 */
export default (document: HTMLDocument, element: HTMLElement): HTMLElement | null => {

    // Elements with attributes whose values are typically unique (e.g. IDs or URLs).
    for (const attribute of ['id', 'name', 'data', 'href', 'src', 'srcset', 'charset']) {
        const value = element.getAttribute(attribute);

        if (value) {
            /*
             * Return when a unique attribute exists regardless of whether a match is found.
             * This ensures later tests don't match elements with different IDs or URLs.
             */
            return findMatch(document, element, `${element.nodeName}[${attribute}="${value}"]`);
        }
    }

    // Elements that typically only occur once.
    if (['base', 'body', 'head', 'html', 'title'].includes(element.nodeName)) {
        return findMatch(document, element, element.nodeName);
    }

    // Elements with content that is typically unique.
    if (['audio', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style', 'video'].includes(element.nodeName)) {
        return findMatch(document, element, element.nodeName, (potentialMatch) => {
            return potentialMatch.innerHTML() === element.innerHTML();
        });
    }

    return null;
};
