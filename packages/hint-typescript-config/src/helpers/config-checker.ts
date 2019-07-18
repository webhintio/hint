import { TypeScriptConfigParse } from '@hint/parser-typescript-config';
import { HintContext } from 'hint';

import { getMessage, MessageName } from '../i18n.import';

/** Helper method to check if a property matches the desired value and report an issue if not. */
const configChecker = (property: string, desiredValue: boolean, messageName: MessageName, context: HintContext) => {

    return (evt: TypeScriptConfigParse) => {
        const { config, getLocation, resource } = evt;
        const properties = property.split('.');

        let current = (config as any)[properties.shift() || ''];

        while (properties.length > 0 && typeof current !== 'undefined') {
            current = current[properties.shift() || ''];
        }

        if (current !== desiredValue) {
            context.report(resource, getMessage(messageName, context.language), { location: getLocation(property) });
        }
    };
};

export { configChecker };
