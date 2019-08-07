import { format } from './format';

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

const getMessages = (path: string, language: string): Messages => {
    const cacheKey = `${path}-${language}`;
    const messages = cache.get(cacheKey);

    if (messages) {
        return messages;
    }

    const languages = language === 'en' ? ['en'] : getLanguages(language);
    const json = languages.reduce((result, lang) => {
        if (result) {
            return result;
        }

        try {
            const json = require(`${path}/_locales/${lang}/messages.json`);

            return json;
        } catch (e) {
            return null;
        }
    }, null as Messages | null);

    if (!json) {
        throw new Error(`Localization file not found for ${path} and language: ${language}`);
    }

    cache.set(cacheKey, json);

    return json;
};

export const getMessage = (key: string, path: string, options?: GetMessageOptions) => {
    const language = (options && options.language) || 'en';
    const substitutions = options && options.substitutions;

    const messages = getMessages(path, language);
    const message = messages[key] && messages[key].message;

    if (!message) {
        return key;
    }

    return format(message, substitutions);
};
