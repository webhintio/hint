/**
 * @fileoverview RuleContext utility for rules
 * @author Anton Molleda (@molant) based on Nicholas C. Zakas ESLint (https://github.com/eslint/eslint/blob/master/lib/rule-context.js)
 */

import { Sonar } from './sonar'; // eslint-disable-line no-unused-vars
import { ProblemLocation, Severity } from './types'; // eslint-disable-line no-unused-vars
import { findElementLocation } from './util/find-element-location';

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

    get pageContent() {
        return this.sonar.pageContent;
    }

    get pageHeaders() {
        return this.sonar.pageHeaders;
    }

    get pageRequest() {
        return this.sonar.pageRequest;
    }

    /** Reports a problem with the resource */
    report(resource: string, nodeOrDescriptor: HTMLElement, message: string, location?: ProblemLocation) {

        // TODO: this should probably contain the info of the resource (HTML, image, font, etc.)
        const descriptor = nodeOrDescriptor;

        let position = location;

        if (position === null && descriptor) {
            position = findElementLocation(nodeOrDescriptor, this.pageContent);
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
