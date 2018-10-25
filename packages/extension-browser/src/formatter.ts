import { IFormatter, Problem, Severity } from 'hint/dist/src/lib/types';

export default class WebExtensionFormatter implements IFormatter {
    public format(problems: Problem[]) {
        problems.forEach((p) => {
            const location = p.location && p.location.line >= 0 ? `:${p.location.line + 1}:${p.location.column + 1}` : '';
            const message = `${p.message} (${p.hintId}) ${p.resource}${location}`;

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
        });
    }
}
