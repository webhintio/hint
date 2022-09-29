/**
 * @fileoverview HintContext utility for hints
 *
 * Based on ESLint's rule-context
 * https://github.com/eslint/eslint/blob/master/lib/hint-context.js
 */
import { URL } from 'url';

import { ProblemLocation, Severity, CodeFix } from '@hint/utils-types';
import { Category, ProblemDocumentation } from '@hint/utils-types';
import { getHTMLCodeSnippet, HTMLElement } from '@hint/utils-dom';

import { Engine } from './engine';
import {
    Events,
    HintMetadata,
    NetworkData,
    StringKeyOf
} from './types';

export type CodeLanguage = 'css' | 'html' | 'http' | 'javascript';

export type ReportOptions = {
    /**
     * The name of the HTML attribute where the issue was found.
     * Used with `element` to get a more targeted `ProblemLocation`.
     */
    attribute?: string;
    /**
     * The target browsers that caused this problem to be reported (if compatibility related).
     * Browser identifiers are in the `browserslist` format (e.g. `['ie 11', 'chrome 100']`).
     */
    browsers?: string[];
    /** The source code to display (defaults to the `outerHTML` of `element`). */
    codeSnippet?: string;
    /** The text within `element` where the issue was found (used to refine a `ProblemLocation`). */
    content?: string;
    /** The documentation for a hint report */
    documentation?: ProblemDocumentation[];
    /** The `HTMLElement` where the issue was found (used to get a `ProblemLocation`). */
    element?: HTMLElement | null;
    /**
     * The `ProblemLocation` where the issue was found.
     * If specified with `element`, represents an offset in the element's content (e.g. for inline CSS in HTML).
     */
    location?: ProblemLocation | null;
    /** The `Severity` to report the issue as. */
    severity: Severity;
    /**
     * Use the specified Severity regardless of hint-level configuration.
     * Supports overrides from hint-specific configuration (e.g. for rules in axe-core).
     */
    forceSeverity?: boolean;
    /** Indicate the language of the codeSnippet. */
    codeLanguage?: CodeLanguage;
    /** A collection of edits that resolve the reported problem. */
    fixes?: CodeFix[];
};

/** Acts as an abstraction layer between hints and the main hint object. */
export class HintContext<E extends Events = Events> {
    private id: string
    private options: any[]
    private meta: HintMetadata
    private severity: Severity
    private engine: Engine<E>
    private ignoredUrls: RegExp[]

    public constructor(hintId: string, engine: Engine<E>, severity: Severity, options: any, meta: HintMetadata, ignoredUrls: RegExp[]) {

        this.id = hintId;
        this.options = options;
        this.meta = meta;
        this.engine = engine;
        this.severity = severity;
        this.ignoredUrls = ignoredUrls;

        Object.freeze(this);
    }

    /** A unique reference to identify the shared `Engine` between contexts. */
    public get engineKey(): object {
        return this.engine;
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
    public get targetedBrowsers(): string[] {
        return this.engine.targetedBrowsers;
    }

    /** Custom configuration (if any) for the given hint */
    public get hintOptions() {
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

    public querySelectorAll(selector: string): HTMLElement[] {
        return this.engine.querySelectorAll(selector);
    }

    /** Ensures fixes in embedded sections (e.g. CSS in HTML) are correctly offset. */
    private adjustFixLocations(element: HTMLElement, fixes?: CodeFix[]): CodeFix[] | undefined {
        if (!fixes) {
            return fixes;
        }

        return fixes.map((fix) => {
            return {
                ...fix,
                location: element.getContentLocation(fix.location) ?? fix.location
            };
        });
    }

    /** Finds the approximative location in the page's HTML for a match in an element. */
    public findProblemLocation(element: HTMLElement, offset: ProblemLocation | null, attribute?: string): ProblemLocation | null {
        if (attribute) {
            const { column, line, startOffset } = element.getAttributeLocation(attribute);

            // Point to the just start of the attribute name (helps editors underline just the name).
            return { column, line, startOffset };
        }

        if (offset) {
            return element.getContentLocation(offset);
        }

        const { column, elementId, line, startOffset } = element.getLocation();

        // Point to the start of the element name (skipping '<', helps editors undeline just the name).
        return { column: column + 1, elementId, line, startOffset };
    }

    /** Reports a problem with the resource. */
    public report(resource: string, message: string, options: ReportOptions) {
        const { attribute, codeSnippet, element, severity = Severity.warning, fixes } = options;
        let sourceCode: string | null = null;
        let position = options.location || null;
        let adjustedFixes = fixes;

        if (attribute && !element) {
            throw new Error('The `element` option must be specified when `attribute` is provided.');
        }

        if (element) {
            // When element is provided, position is an offset in the content.
            position = this.findProblemLocation(element, position, attribute);
            sourceCode = getHTMLCodeSnippet(element);
        }

        if (element && options.codeLanguage && options.codeLanguage !== 'html') {
            // When element is provided and language is embedded (e.g. CSS or JS), fix locations need adjusted.
            adjustedFixes = this.adjustFixLocations(element, fixes);
        }

        /**
         * By default all hints get configured with `default` so they can
         * decide the severity of each report unless it's overriden by the
         * user.
         */
        const finalSeverity = this.severity !== Severity.default && !options.forceSeverity ?
            this.severity :
            severity;

        /*
         * If location is undefined or equal to null, `position` will be set as `{ column: -1, line: -1 }` later in `hint.report`.
         * So pass the `location` on as it is.
         */

        this.engine.report({
            browsers: options.browsers,
            category: (this.meta && this.meta.docs && this.meta.docs.category) ? this.meta.docs.category : Category.other,
            codeLanguage: options.codeLanguage,
            documentation: options.documentation,
            fixes: adjustedFixes,
            hintId: this.id,
            location: position || { column: -1, line: -1 },
            message,
            resource,
            severity: finalSeverity,
            sourceCode: codeSnippet || sourceCode || ''
        });
    }

    /** Subscribe an event in hint. */
    public on<K extends StringKeyOf<E>>(event: K, listener: (data: E[K], event: string) => void) {
        this.engine.onHintEvent(this.id, event, listener);
    }

    public isUrlIgnored(resource: string) {
        return this.ignoredUrls.some((urlIgnored: RegExp) => {
            return urlIgnored.test(resource);
        });
    }

    public get language() {
        return this.engine.language;
    }
}
