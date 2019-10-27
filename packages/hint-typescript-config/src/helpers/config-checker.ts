import { TypeScriptConfigParse, TypeScriptConfig } from '@hint/parser-typescript-config';
import { HintContext, IJSONLocationFunction } from 'hint';

import { getMessage, MessageName } from '../i18n.import';

const findValue = (property: string, config: TypeScriptConfig) => {
    const properties = property.split('.');

    let current = (config as any)[properties.shift() || ''];

    while (properties.length > 0 && typeof current !== 'undefined') {
        current = current[properties.shift() || ''];
    }

    return current;
};

const findLocation = (propertyPath: string, mergedConfig: TypeScriptConfig, originalConfig: TypeScriptConfig, getLocation: IJSONLocationFunction) => {
    const valueInOriginal = findValue(propertyPath, originalConfig);

    if (typeof valueInOriginal !== 'undefined') {
        return getLocation(propertyPath, { at: 'value' });
    }

    const valueInMerged = findValue(propertyPath, mergedConfig);

    if (typeof valueInMerged !== 'undefined') {
        return getLocation('extends', { at: 'value' });
    }

    const ancestors = propertyPath.split('.').slice(0, -1);

    while (ancestors.length > 0) {
        const ancestor = ancestors.pop();

        if (ancestor && ancestor in originalConfig) {
            return getLocation(ancestor);
        }
    }

    return null;
};

/** Helper method to check if a property matches the desired value and report an issue if not. */
const configChecker = (property: string, desiredValue: boolean, messageName: MessageName, context: HintContext) => {

    return (evt: TypeScriptConfigParse) => {
        const { config, getLocation, mergedConfig, originalConfig, resource } = evt;
        const current = findValue(property, config);

        if (current !== desiredValue) {
            const location = findLocation(property, mergedConfig, originalConfig, getLocation);
            const message = getMessage(messageName, context.language);

            context.report(resource, message, { location });
        }
    };
};

export { configChecker, findLocation, findValue };
