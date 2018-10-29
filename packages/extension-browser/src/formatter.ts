import { Category } from 'hint/dist/src/lib/enums/category';
import { IFormatter, Problem, Severity } from 'hint/dist/src/lib/types';

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
        console.groupCollapsed(`${id}: ${reports.length} ${reports.length === 1 ? 'hint' : 'hints'}`);

        console.info(`Learn why this matters and how to fix it at https://webhint.io/docs/user-guide/hints/hint-${id}/`);

        reports.forEach(this.formatProblem);

        console.groupEnd();
    }

    private formatCategory(category: string, matching: Problem[]) {
        console.group(`${category.toUpperCase()}`);

        const hints = new Set<string>();

        // TODO: Include all hints, even those that didn't report any problems.
        matching.forEach((p) => {
            hints.add(p.hintId);
        });

        const hintIds = Array.from(hints).sort();

        hintIds.forEach((id) => {

            const reports = matching.filter((p) => {
                return p.hintId === id;
            });

            this.formatHint(id, reports);
        });

        if (!hintIds.length) {
            console.info('PASSED');
        }

        console.groupEnd();
    }

    public format(problems: Problem[]) {
        console.group('webhint');

        Object.keys(Category).forEach((category) => {
            if (typeof category !== 'string' || !isNaN(parseInt(category))) {
                return;
            }

            if (category === Category.development || category === Category.other) {
                return;
            }

            const matching = problems.filter((p) => {
                return p.category === category;
            });

            this.formatCategory(category, matching);
        });

        console.groupEnd();
    }
}
