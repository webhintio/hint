import { Category } from '@hint/utils';
import { getMessage } from './i18n.import';

export const getCategoryName = (category: Category, language = 'en') => {
    return getMessage(category, language);
};
