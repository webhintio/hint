/**
 * @fileoverview RuleContext utility for rules
 *
 * Based on ESLint's rule-context
 * https://github.com/eslint/eslint/blob/master/lib/rule-context.js
 */

import { Sonar } from './sonar'; // eslint-disable-line no-unused-vars
import { IAsyncHTMLElement, INetworkData, IProblemLocation, IRuleMetadata, Severity } from './types'; // eslint-disable-line no-unused-vars
import { findInElement, findProblemLocation } from './utils/location-helpers';


/** Acts as an abstraction layer between rules and the main sonar object. */
export class RuleContext {
    private id: string
    private options: Array<any>
    private meta: IRuleMetadata
    private severity: Severity
    private sonar: Sonar

    constructor(ruleId: string, sonar: Sonar, severity: Severity | string, options, meta: IRuleMetadata) {

        this.id = ruleId;
        this.options = options;
        this.meta = meta;
        this.sonar = sonar;
        this.severity = typeof severity === 'string' ? Severity[severity] : severity;

        Object.freeze(this);

    }

    /** The DOM of the page. */
    get pageDOM() {
        return this.sonar.pageDOM;
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
    get targetedBrowsers(): Array<string> {
        return this.sonar.targetedBrowsers;
    }

    /** Custom configuration (if any) for the given rule */
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
    public evaluate(source: string): Promise<any> {
        return this.sonar.evaluate(source);
    }

    /** A useful way of making requests. */
    public fetchContent(target, headers?): Promise<INetworkData> {
        return this.sonar.fetchContent(target, headers);
    }

    public querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>> {
        return this.sonar.querySelectorAll(selector);
    }

    /** Finds the exact location of the given content in the HTML that represents the `element`. */
    public findInElement(element: IAsyncHTMLElement, content: string): Promise<IProblemLocation> {
        return findInElement(element, content);
    }

    /** Finds the approximative location in the page's HTML for a match in an element. */
    public findProblemLocation(element: IAsyncHTMLElement, content?: string): Promise<IProblemLocation> {
        return findProblemLocation(element, { column: 0, line: 0 }, content);
    }

    /** Reports a problem with the resource. */
    public async report(resource: string, element: IAsyncHTMLElement, message: string, content?: string, location?: IProblemLocation, severity?: Severity): Promise<void> { //eslint-disable-line require-await
        let position: IProblemLocation = location;
        let sourceCode: string = null;

        if (element) {
            position = await findProblemLocation(element, { column: 0, line: 0 }, content);
            sourceCode = (await element.outerHTML()).replace(/[\t]/g, '    ');
        }

        if (position === null) {
            position = {
                column: null,
                line: null
            };
        }

        this.sonar.report(
            this.id,
            severity || this.severity,
            sourceCode,
            position,
            message,
            resource
        );
    }
}
