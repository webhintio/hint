import { Category } from 'hint/dist/src/lib/enums/category';
import { FormatterOptions, HintResources, IFormatter, IHintConstructor, Problem } from 'hint/dist/src/lib/types';

import { browser } from '../shared/globals';
import { CategoryResults, HintResults } from '../shared/types';
import metas from '../shared/metas.import';

export default class WebExtensionFormatter implements IFormatter {

    private getCategories(resources: HintResources): Category[] {
        const categories = resources.hints.map(this.getHintCategory);

        return Array.from(new Set(categories)).sort() as Category[];
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
            const meta = metas.filter((meta) => {
                return meta.id === id;
            })[0];

            const name = meta && meta.docs && meta.docs.name || id;

            return {
                helpURL: `https://webhint.io/docs/user-guide/hints/hint-${id}/`,
                id,
                name,
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

    public format(problems: Problem[], options: FormatterOptions) {

        // The browser extension always provides resources to the formatter.
        const resources = options.resources!;

        const categories = this.buildCategoryResults(resources, problems);

        // Forward results to the devtools page (via the background script).
        browser.runtime.sendMessage({ results: { categories, url: options.target } });
    }
}
