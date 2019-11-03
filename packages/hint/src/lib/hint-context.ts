/**
 * @fileoverview HintContext utility for hints
 *
 * Based on ESLint's rule-context
 * https://github.com/eslint/eslint/blob/master/lib/hint-context.js
 */
import { URL } from 'url';

import { HTMLElement } from '@hint/utils/dist/src/dom/html';

import { Engine } from './engine';
import {
    Events,
    HintMetadata,
    NetworkData,
    StringKeyOf
} from './types';
import { ProblemLocation, Severity } from '@hint/utils/dist/src/types/problems';
import { Category } from '@hint/utils/dist/src/types/category';
import { getHTMLCodeSnippet } from '@hint/utils/dist/src/report/get-html-code-snippet';

export type CodeLanguage = 'css' | 'html' | 'http' | 'javascript';

export type ReportOptions = {
    /** The source code to display (defaults to the `outerHTML` of `element`). */
    codeSnippet?: string;
    /** The text within `element` where the issue was found (used to refine a `ProblemLocation`). */
    content?: string;
    /** The `HTMLElement` where the issue was found (used to get a `ProblemLocation`). */
    element?: HTMLElement | null;
    /**
     * The `ProblemLocation` where the issue was found.
     * If specified with `element`, represents an offset in the element's content (e.g. for inline CSS in HTML).
     */
    location?: ProblemLocation | null;
    /** The `Severity` to report the issue as. */
    severity?: Severity;
    /** Indicate the language of the codeSnippet. */
    codeLanguage?: CodeLanguage;
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

    /** Finds the approximative location in the page's HTML for a match in an element. */
    public findProblemLocation(element: HTMLElement, offset: ProblemLocation | null): ProblemLocation | null {
        if (offset) {
            return element.getContentLocation(offset);
        }

        return element.getLocation();
    }

    /** Reports a problem with the resource. */
    public report(resource: string, message: string, options: ReportOptions = {}) {
        const { codeSnippet, element, severity = Severity.warning } = options;
        let sourceCode: string | null = null;
        let position = options.location || null;

        if (element) {
            // When element is provided, position is an offset in the content.
            position = this.findProblemLocation(element, position);
            sourceCode = getHTMLCodeSnippet(element);
        }

        /**
         * By default all hints get configured with `default` so they can
         * decide the severity of each report unless it's overriden by the
         * user.
         */
        const finalSeverity = this.severity !== Severity.default ?
            this.severity :
            severity;

        /*
         * If location is undefined or equal to null, `position` will be set as `{ column: -1, line: -1 }` later in `hint.report`.
         * So pass the `location` on as it is.
         */

        this.engine.report({
            category: (this.meta && this.meta.docs && this.meta.docs.category) ? this.meta.docs.category : Category.other,
            codeLanguage: options.codeLanguage,
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
