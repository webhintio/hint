import camelCase = require('lodash/camelCase');

import { getMessage as extensionGetMessage } from '../devtools/utils/i18n';

type GetMessage = typeof import('@hint/utils/dist/src/i18n/get-message').getMessage;

export const getMessage: GetMessage = (key, packageName, options?) => {
    const prefix = camelCase(packageName.replace('@hint/', ''));
    const substitutions = options && options.substitutions;

    return extensionGetMessage(`${prefix}_${key}` as any, substitutions);
};
