import { Category } from 'hint/dist/src/lib/enums/category';
import { FormatterOptions, HintResources, IFormatter, IHintConstructor, Problem, Severity } from 'hint/dist/src/lib/types';

import browser from '../shared/browser';
import { CategoryResults, HintResults } from '../shared/types';

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

    private formatHint(hint: HintResults) {
        if (hint.problems.length) {
            console.groupCollapsed(`${hint.problems.length} ${hint.problems.length === 1 ? 'hint' : 'hints'}: ${hint.name}`);
        } else {
            console.groupCollapsed(`PASSED: ${hint.name}`);
        }

        const fixText = hint.problems.length ? ' and how to fix it' : '';

        console.info(`Learn why this matters${fixText} at https://webhint.io/docs/user-guide/hints/hint-${hint.id}/`);

        hint.problems.forEach(this.formatProblem);

        console.groupEnd();
    }

    private formatCategory(category: CategoryResults) {
        console.group(`${category.name.toUpperCase()}`);

        category.hints.forEach((hint) => {
            return this.formatHint(hint);
        });

        console.groupEnd();
    }

    private getCategories(resources: HintResources): string[] {
        const categories = resources.hints.map(this.getHintCategory);

        return Array.from(new Set(categories)).sort();
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

    private buildHintResults(resources: HintResources, problems: Problem[], category: string): HintResults[] {
        return this.getHints(resources, category).map((id) => {
            return {
                helpURL: `https://webhint.io/docs/user-guide/hints/hint-${id}/`,
                id,
                name: id, // TODO: Map to a user-friendly name.
                problems: problems.filter((problem) => {
                    return id === problem.hintId;
                })
            };
        });
    }

    private buildCategoryResults(resources: HintResources, problems: Problem[]): CategoryResults[] {
        return this.getCategories(resources).map((name) => {
            const hints = this.buildHintResults(resources, problems, name);

            // Order hints so those with problems appear first.
            hints.sort((a, b) => {
                if (a.problems.length && !b.problems.length) {
                    return -1;
                } else if (!a.problems.length && b.problems.length) {
                    return 1;
                }

                return 0;
            });

            return {
                hints,
                name,
                passed: hints.filter((hint) => {
                    return hint.problems.length === 0;
                }).length
            };
        });
    }

    public format(problems: Problem[], target: string, options: FormatterOptions) {
        console.group('webhint');

        // The browser extension always provides resources to the formatter.
        const resources = options.resources!;

        const categories = this.buildCategoryResults(resources, problems);

        categories.forEach((category) => {
            return this.formatCategory(category);
        });

        // Forward results to the devtools page (via the background script).
        browser.runtime.sendMessage({ results: { categories } });

        console.groupEnd();
    }
}
