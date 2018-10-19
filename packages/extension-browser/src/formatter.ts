import { IFormatter, Problem, Severity } from 'hint/dist/src/lib/types';

export default class WebExtensionFormatter implements IFormatter {
    public format(problems: Problem[]) {
        problems.forEach((p) => {
            const message = `${p.message} in ${p.resource} at ${p.location.line}:${p.location.column} (${p.hintId})`;

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
