/**
 * @fileoverview RuleContext utility for rules
 * @author Anton Molleda (@molant) based on Nicholas C. Zakas ESLint (https://github.com/eslint/eslint/blob/master/lib/rule-context.js)
 */

import { Sonar } from './sonar'; // eslint-disable-line no-unused-vars
import { ProblemLocation, Severity } from './types'; // eslint-disable-line no-unused-vars
import { findProblemLocation } from './util/location-helpers';

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

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

    /** The original HTML of the page */
    get pageContent() {
        return this.sonar.pageContent;
    }

    /** The headers of the response when retrieving the HTML */
    get pageHeaders() {
        return this.sonar.pageHeaders;
    }

    /** A useful way of making requests */
    get fetchContent() {
        return this.sonar.fetchContent;
    }

    /** Finds the exact location in the page's HTML for a match in an element */
    findProblemLocation(element: HTMLElement, content?: string) {
        return findProblemLocation(element, {column: 0, line: 0}, content);
    }

    /** Reports a problem with the resource */
    report(resource: string, nodeOrDescriptor: HTMLElement, message: string, location?: ProblemLocation) {

        // TODO: this should probably contain the info of the resource (HTML, image, font, etc.)
        const descriptor = nodeOrDescriptor;

        let position = location;

        if (!position && descriptor) {
            position = findProblemLocation(nodeOrDescriptor, {column: 0, line: 0});
        }

        if (position === null) {
            position = {
                column: null,
                line: null
            };
        }

        this.sonar.report(
            this.id,
            this.severity,
            descriptor,
            position,
            message,
            resource
        );

    }
}
