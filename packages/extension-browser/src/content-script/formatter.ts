import { Category } from 'hint/dist/src/lib/enums/category';
import { FormatterOptions, HintResources, IFormatter, IHintConstructor, Problem, Severity } from 'hint/dist/src/lib/types';

import browser from '../shared/browser';

export default class WebExtensionFormatter implements IFormatter {

    private formatProblem(p: Problem) {
        const location = p.location && p.location.line >= 0 ? `:${p.location.line + 1}:${p.location.column + 1}` : '';
        const message = `${p.message} ${p.resource}${location}`;

        switch (p.severity) {
            case Severity.error:
                console.error(message);
                break;
            case Severity.warning:
                console.warn(message);
                break;
            default:
                console.info(message);
                break;
        }
    }

    private formatHint(id: string, reports: Problem[]) {
        if (reports.length) {
            console.groupCollapsed(`${reports.length} ${reports.length === 1 ? 'hint' : 'hints'}: ${id}`);
        } else {
            console.groupCollapsed(`PASSED: ${id}`);
        }

        const fixText = reports.length ? ' and how to fix it' : '';

        console.info(`Learn why this matters${fixText} at https://webhint.io/docs/user-guide/hints/hint-${id}/`);

        reports.forEach(this.formatProblem);

        console.groupEnd();
    }

    private getHintCategory(hint: IHintConstructor): string {
        return hint.meta.docs && hint.meta.docs.category || Category.other;
    }

    private getHints(resources: HintResources, category?: string): string[] {
        return resources.hints.filter((hint) => {
            return !category || category === this.getHintCategory(hint);
        }).map((hint) => {
            return hint.meta.id;
        });
    }

    private formatCategory(category: string, matching: Problem[], resources: HintResources) {
        console.group(`${category.toUpperCase()}`);

        const hints = this.getHints(resources, category);

        const failedHints = hints.filter((id) => {
            return matching.some((p) => {
                return p.hintId === id;
            });
        });

        const passedHints = hints.filter((id) => {
            return matching.every((p) => {
                return p.hintId !== id;
            });
        });

        [...failedHints, ...passedHints].forEach((id) => {

            const reports = matching.filter((p) => {
                return p.hintId === id;
            });

            this.formatHint(id, reports);
        });

        if (!hints.length) {
            console.info('PASSED');
        }

        console.groupEnd();
    }

    private getCategories(resources: HintResources): string[] {
        const categories = resources.hints.map(this.getHintCategory);

        return Array.from(new Set(categories));
    }

    public format(problems: Problem[], target: string, options: FormatterOptions) {
        console.group('webhint');

        // The browser extension always provides resources to the formatter.
        const resources = options.resources!;

        const categories = this.getCategories(resources);
        const hints = this.getHints(resources);

        categories.forEach((category) => {

            const matching = problems.filter((p) => {
                return p.category === category;
            });

            this.formatCategory(category, matching, resources);
        });

        // Forward results to the devtools page (via the background script).
        browser.runtime.sendMessage({
            results: {
                categories,
                hints,
                problems
            }
        });

        console.groupEnd();
    }
}
