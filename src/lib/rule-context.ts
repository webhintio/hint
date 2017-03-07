/**
 * @fileoverview RuleContext utility for rules
 * @author Anton Molleda (@molant) based on Nicholas C. Zakas ESLint (https://github.com/eslint/eslint/blob/master/lib/rule-context.js)
 */

import { validate as ruleValidator } from './config/config-rules';
import { Severity, Location } from './types';
import {Sonar} from './sonar';

// ------------------------------------------------------------------------------
// Helper functions
// ------------------------------------------------------------------------------

// TODO: maybe this should go into another file for easier testing?
/** Finds the Location of an HTMLElement in the document */
const findElementLocation = (element: HTMLElement): Location => {
    const html = element.ownerDocument.children[0].outerHTML;
    const occurrences = (html.match(new RegExp(element.outerHTML, 'g')) || []).length;
    let initHtml;

    if (occurrences === 1) {
        initHtml = html.substring(0, html.indexOf(element.outerHTML));
    } else if (occurrences > 1) {
        // TODO: return the right start place
        initHtml = html.substring(0, html.indexOf(element.outerHTML));
    } else {
        return null;
    }

    const lines = initHtml.split('\n');

    return {
        column: lines.pop().length,
        line: lines.length + 1
    };
};

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

    /** Reports a problem with the resource */
    report(resource: string, nodeOrDescriptor: HTMLElement, message: string, location? : Location) {
        // TODO: this should probably contain the info of the resource (HTML, image, font, etc.)
        const descriptor = nodeOrDescriptor;

        let position;

        if (location !== null && descriptor.outerHTML) {
            position = findElementLocation(nodeOrDescriptor);
            position.column += location.column;
            position.line += location.line;
        } else {
            position = location;
        }

        this.sonar.report(
            this.id,
            this.severity,
            descriptor,
            position,
            message,
            resource,
            this.meta
        );
    }
}
