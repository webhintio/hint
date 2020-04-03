import camelCase = require('lodash/camelCase');
// @ts-ignore
import messages = require('../../../_locales/en/messages.json');

type GetMessage = typeof import('@hint/utils-i18n').getMessage;

export const getMessage: GetMessage = (key, path, options?) => {
    /*
     * Path will be something like:
     * ..\hint-axe\dist\src
     * or
     * ../hint-axe/dist/src
     */
    const pathParts = path.split(/\\|\//g);
    const packageName = pathParts[pathParts.length - 3];
    const prefix = camelCase(packageName);
    const substitutions = options && options.substitutions;
    const name = `${prefix}_${key}`;
    const message: string = (messages as any)[name].message;

    return message.replace(/\$(\d+)/g, (match, number) => {
        if (typeof substitutions === 'string') {
            return substitutions;
        }

        if (!substitutions) {
            return match;
        }

        return substitutions[parseInt(number) - 1];
    });
};
