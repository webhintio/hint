import { JSDOM } from 'jsdom';

export default (html: string, allowScripts: boolean = false): JSDOM => {
    return new JSDOM(html, {

        /** Needed to provide line/column positions for elements. */
        includeNodeLocations: true,

        /**
         * Needed to let hints run script against the DOM.
         * However the page itself is kept static because `connector-local`
         * validates files individually without loading resources.
         */
        runScripts: allowScripts ? 'outside-only' : undefined
    });
};
