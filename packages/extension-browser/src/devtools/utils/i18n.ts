import { browser } from '../../shared/globals';
import { MessageName } from '../../shared/i18n.import';

export { MessageName } from '../../shared/i18n.import';

export const getMessage = (key: MessageName, substitutions?: string | string[]) => {
    return browser.i18n.getMessage(key, substitutions);
};
