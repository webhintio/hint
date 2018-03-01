/**
 * @fileoverview RuleContext utility for rules
 *
 * Based on ESLint's rule-context
 * https://github.com/eslint/eslint/blob/master/lib/rule-context.js
 */

import { Sonarwhal } from './sonarwhal';
import { IAsyncHTMLElement, NetworkData, ProblemLocation, RuleMetadata, Severity } from './types';
import { findInElement, findProblemLocation } from './utils/location-helpers';


/** Acts as an abstraction layer between rules and the main sonarwhal object. */
export class RuleContext {
    private id: string
    private options: Array<any>
    private meta: RuleMetadata
    private severity: Severity
    private sonarwhal: Sonarwhal

    public constructor(ruleId: string, sonarwhal: Sonarwhal, severity: Severity, options, meta: RuleMetadata) {

        this.id = ruleId;
        this.options = options;
        this.meta = meta;
        this.sonarwhal = sonarwhal;
        this.severity = severity;

        Object.freeze(this);
    }

    /** The DOM of the page. */
    public get pageDOM() {
        return this.sonarwhal.pageDOM;
    }

    /** The original HTML of the page. */
    public get pageContent() {
        return this.sonarwhal.pageContent;
    }

    /** The headers of the response when retrieving the HTML. */
    public get pageHeaders() {
        return this.sonarwhal.pageHeaders;
    }

    /** List of browsers to target as specified by the sonarwhal configuration. */
    public get targetedBrowsers(): Array<string> {
        return this.sonarwhal.targetedBrowsers;
    }

    /** Custom configuration (if any) for the given rule */
    public get ruleOptions() {
        if (Array.isArray(this.options)) {
            return this.options[1];
        }

        return null;
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    /** Injects JavaScript into the target. */
    public evaluate(source: string): Promise<any> {
        return this.sonarwhal.evaluate(source);
    }

    /** A useful way of making requests. */
    public fetchContent(target, headers?): Promise<NetworkData> {
        return this.sonarwhal.fetchContent(target, headers);
    }

    public querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>> {
        return this.sonarwhal.querySelectorAll(selector);
    }

    /** Finds the exact location of the given content in the HTML that represents the `element`. */
    public findInElement(element: IAsyncHTMLElement, content: string): Promise<ProblemLocation> {
        return findInElement(element, content);
    }

    /** Finds the approximative location in the page's HTML for a match in an element. */
    public findProblemLocation(element: IAsyncHTMLElement, content?: string): Promise<ProblemLocation> {
        return findProblemLocation(element, { column: 0, line: 0 }, content);
    }

    /** Reports a problem with the resource. */
    public async report(resource: string, element: IAsyncHTMLElement, message: string, content?: string, location?: ProblemLocation, severity?: Severity, codeSnippet?: string): Promise<void> {
        let position: ProblemLocation = location;
        let sourceCode: string = null;

        if (element) {
            position = await findProblemLocation(element, { column: 0, line: 0 }, content);
            sourceCode = (await element.outerHTML()).replace(/[\t]/g, '    ');
        }

        /*
         * If location is undefined or equal to null, `position` will be set as `{ column: -1, line: -1 }` later in `sonarwhal.report`.
         * So pass the `location` on as it is.
         */

        this.sonarwhal.report(
            this.id,
            severity || this.severity,
            codeSnippet || sourceCode,
            position,
            message,
            resource
        );
    }

    /** Subscribe an event in sonarwhal. */
    public on(event, listener) {
        this.sonarwhal.onRuleEvent(this.id, event, listener);
    }
}
