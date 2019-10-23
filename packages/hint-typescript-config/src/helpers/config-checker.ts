import { TypeScriptConfigParse, TypeScriptConfig } from '@hint/parser-typescript-config';
import { HintContext } from 'hint';

import { getMessage, MessageName } from '../i18n.import';

const findValue = (property: string, config: TypeScriptConfig) => {
    const properties = property.split('.');

    let current = (config as any)[properties.shift() || ''];

    while (properties.length > 0 && typeof current !== 'undefined') {
        current = current[properties.shift() || ''];
    }

    return current;
};

/** Helper method to check if a property matches the desired value and report an issue if not. */
const configChecker = (property: string, desiredValue: boolean, messageName: MessageName, context: HintContext) => {

    return (evt: TypeScriptConfigParse) => {
        const { config, getLocation, originalConfig, resource } = evt;
        const current = findValue(property, config);

        if (current !== desiredValue) {
            const inOriginal = findValue(property, originalConfig);

            if (current !== inOriginal && 'extends' in originalConfig) {
                return context.report(resource, getMessage(messageName, context.language), { location: getLocation('extends', { at: 'value' }) });
            }

            if (typeof inOriginal !== 'undefined') {
                return context.report(resource, getMessage(messageName, context.language), { location: getLocation(property, { at: 'value' }) });
            }

            return context.report(resource, getMessage(messageName, context.language), { location: getLocation(property) });
        }
    };
};

export { configChecker };
