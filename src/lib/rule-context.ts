/**
 * @fileoverview RuleContext utility for rules
 *
 * Based on ESLint's rule-context
 * https://github.com/eslint/eslint/blob/master/lib/rule-context.js
 */

import { Sonar } from './sonar'; // eslint-disable-line no-unused-vars
import { IAsyncHTMLElement, INetworkData, IProblemLocation, Severity } from './types'; // eslint-disable-line no-unused-vars
import { findInElement, findProblemLocation } from './utils/location-helpers';


/** Acts as an abstraction layer between rules and the main sonar object. */
export class RuleContext {
    private id: string
    private options: Array<any>
    private meta: { any }
    private severity: Severity
    private sonar: Sonar

    constructor(ruleId: string, sonar: Sonar, severity: Severity | string, options, meta) {

        this.id = ruleId;
        this.options = options;
        this.meta = meta;
        this.sonar = sonar;
        this.severity = typeof severity === 'string' ? Severity[severity] : severity;

        Object.freeze(this);

    }

    /** The original HTML of the page. */
    get pageContent() {
        return this.sonar.pageContent;
    }

    /** The headers of the response when retrieving the HTML. */
    get pageHeaders() {
        return this.sonar.pageHeaders;
    }

    /** List of browsers to target as specified by the sonar configuration. */
    get targetedBrowsers() {
        return this.sonar.targetedBrowsers;
    }

    get ruleOptions() {
        if (Array.isArray(this.options)) {
            return this.options[1];
        }

        return null;
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    /** Injects JavaScript into the target. */
    public evaluate(source: string) {
        return this.sonar.evaluate(source);
    }

    /** A useful way of making requests. */
    public fetchContent(target, headers?): Promise<INetworkData> {
        return this.sonar.fetchContent(target, headers);
    }

    public querySelectorAll(selector: string) {
        return this.sonar.querySelectorAll(selector);
    }

    /** Finds the exact location of the given content in the HTML that represents the `element`. */
    public findInElement(element: IAsyncHTMLElement, content: string): Promise<IProblemLocation> {
        return findInElement(element, content);
    }

    /** Finds the approximative location in the page's HTML for a match in an element. */
    public findProblemLocation(element: IAsyncHTMLElement, content?: string) {
        return findProblemLocation(element, { column: 0, line: 0 }, content);
    }

    /** Reports a problem with the resource. */
    public async report(resource: string, descriptor: IAsyncHTMLElement, message: string, location?: IProblemLocation) { //eslint-disable-line require-await
        // let position = location;

        // if (!position && descriptor) {
        //     position = await findProblemLocation(descriptor, { column: 0, line: 0 });
        // }

        // if (position === null) {
        //     position = {
        //         column: null,
        //         line: null
        //     };
        // }

        this.sonar.report(
            this.id,
            this.severity,
            descriptor,
            location,
            message,
            resource
        );
    }
}
