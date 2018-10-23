import { IFormatter, Problem } from 'hint/dist/src/lib/types';

export default class WebExtensionFormatter implements IFormatter {
    public format(problems: Problem[]) {
        problems.forEach((p) => {
            const message = `${p.message} in ${p.resource} at ${p.location.line}:${p.location.column} (${p.hintId})`;

            switch (p.severity) {
                case 2: // Severity.error
                    console.error(message);
                    break;
                case 1: // Severity.warning
                    console.warn(message);
                    break;
                default:
                    console.info(message);
                    break;
            }
        });
    }
}
