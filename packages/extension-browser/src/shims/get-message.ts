import { getMessage as extensionGetMessage } from '../devtools/utils/i18n';

type GetMessage = typeof import('@hint/utils/dist/src/i18n/get-message').getMessage;

export const getMessage: GetMessage = (key, packageName, options?) => {
    const substitutions = options && options.substitutions;

    return extensionGetMessage(`${packageName}/${key}` as any, substitutions);
};
