/**
 * @fileoverview RuleContext utility for rules
 *
 * Based on ESLint's rule-context
 * https://github.com/eslint/eslint/blob/master/lib/rule-context.js
 */
import { URL } from 'url';

import { Engine } from './engine';
import { IAsyncHTMLElement, NetworkData, ProblemLocation, RuleMetadata, Severity } from './types';
import { findInElement, findProblemLocation } from './utils/location-helpers';


/** Acts as an abstraction layer between rules and the main hint object. */
export class RuleContext {
    private id: string
    private options: Array<any>
    private meta: RuleMetadata
    private severity: Severity
    private engine: Engine

    public constructor(ruleId: string, engine: Engine, severity: Severity, options, meta: RuleMetadata) {

        this.id = ruleId;
        this.options = options;
        this.meta = meta;
        this.engine = engine;
        this.severity = severity;

        Object.freeze(this);
    }

    /** The DOM of the page. */
    public get pageDOM() {
        return this.engine.pageDOM;
    }

    /** The original HTML of the page. */
    public get pageContent() {
        return this.engine.pageContent;
    }

    /** The headers of the response when retrieving the HTML. */
    public get pageHeaders() {
        return this.engine.pageHeaders;
    }

    /** List of browsers to target as specified by the hint configuration. */
    public get targetedBrowsers(): Array<string> {
        return this.engine.targetedBrowsers;
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
        return this.engine.evaluate(source);
    }

    /** A useful way of making requests. */
    public fetchContent(target: string | URL, headers?: object): Promise<NetworkData> {
        return this.engine.fetchContent(target, headers);
    }

    public querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>> {
        return this.engine.querySelectorAll(selector);
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
    public async report(resource: string, element: IAsyncHTMLElement | null, message: string, content?: string, location?: ProblemLocation, severity?: Severity, codeSnippet?: string): Promise<void> {
        let position: ProblemLocation = location;
        let sourceCode: string = null;

        if (element) {
            position = await findProblemLocation(element, { column: 0, line: 0 }, content);
            sourceCode = (await element.outerHTML()).replace(/[\t]/g, '    ');
        }

        /*
         * If location is undefined or equal to null, `position` will be set as `{ column: -1, line: -1 }` later in `hint.report`.
         * So pass the `location` on as it is.
         */

        this.engine.report(
            this.id,
            severity || this.severity,
            codeSnippet || sourceCode,
            position,
            message,
            resource
        );
    }

    /** Subscribe an event in hint. */
    public on(event, listener) {
        this.engine.onRuleEvent(this.id, event, listener);
    }
}
