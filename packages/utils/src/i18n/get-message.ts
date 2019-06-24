import * as path from 'path';
import { format } from 'util';

import { loadJSONFile } from '../fs';

export type GetMessageOptions = {
    language?: string;
    substitutions?: string | string[];
}

type Message = {
    description: string;
    message: string;
}

type Messages = {
    [key: string]: Message;
}

const cache = new Map<string, Messages>();

/**
 * Returns the package name give a key.
 * The key should have this structure:
 *     packageid/key
 *
 *     @hint/hint-button-type/attributeNotSet
 */
const getPackage = (key: string) => {
    const packageName = key.substr(0, key.lastIndexOf('/'));

    return packageName;
};

/**
 * Return a list with the selected language
 * and all the fallbacks
 *
 * e.g.:
 *    es-es => ['es-es', 'es', 'en']
 *    en-uk => ['en-uk', 'en'];
 */
const getLanguages = (language: string) => {
    const languageParts = language.split('-');
    const mainLanguage = languageParts[0];
    const languages = [language, mainLanguage];

    if (mainLanguage !== 'en') {
        languages.push('en');
    }

    return languages;
};

const getMessages = (packageName: string, language: string): Messages => {
    const cacheKey = `${packageName}-${language}`;
    const messages = cache.get(cacheKey);

    if (messages) {
        return messages;
    }

    const languages = language === 'en' ? ['en'] : getLanguages(language);
    const json = languages.reduce((result, lang) => {
        if (result) {
            return result;
        }

        const jsonPath = path.join(require.resolve(packageName), '..', '_locales', lang, 'messages.json');

        try {
            const json = loadJSONFile(jsonPath);

            return json;
        } catch (e) {
            return null;
        }
    }, null as Messages | null);

    if (!json) {
        throw new Error(`Localization file not found for ${packageName} and language: ${language}`);
    }

    cache.set(cacheKey, json);

    return json;
};

export const getMessage = (key: string, options?: GetMessageOptions) => {
    const language = (options && options.language) || 'en';
    const substitutions = options && options.substitutions;

    const pacakgeName = getPackage(key);
    const messages = getMessages(pacakgeName, language);

    /*
     * format always print the extra parameters even if this is
     * null or undefined, and if you don't have any format
     * specifier.
     * e.g:
     *     format('test string', undefined)
     *
     *     output => test string undefined
     *
     * And that is why we need to check if substitutions is
     * defined or not.
     */
    if (!substitutions) {
        return messages[key].message;
    } else if (Array.isArray(substitutions)) {
        return format(messages[key].message, ...substitutions);
    }

    return format(messages[key].message, substitutions);
};
