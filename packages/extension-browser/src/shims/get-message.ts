import camelCase = require('lodash/camelCase');

import { getMessage as extensionGetMessage } from '../devtools/utils/i18n';

type GetMessage = typeof import('@hint/utils/dist/src/i18n/get-message').getMessage;

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

    return extensionGetMessage(`${prefix}_${key}` as any, substitutions);
};
