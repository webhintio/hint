import { browser } from '../../../shared/globals';
import { MessageName } from '../../../shared/i18n.import';

export const getMessage = (key: MessageName, substitutions?: string | string[]) => browser.i18n.getMessage(key, substitutions);
