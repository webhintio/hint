import { TypeScriptConfigParse } from '@sonarwhal/parser-typescript-config/dist/src/types';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';

/** Helper method to check if a property matches the desired value and report an issue if not. */
const configChecker = (property: string, desiredValue: boolean, message: string, context: RuleContext) => {

    return async (evt: TypeScriptConfigParse): Promise<void> => {
        const { config, resource } = evt;
        const properties = property.split('.');

        let current = config[properties.shift()];

        while (properties.length > 0 && typeof current !== 'undefined') {
            current = current[properties.shift()];
        }

        if (current !== desiredValue) {
            await context.report(resource, null, message);
        }
    };
};

export { configChecker };
