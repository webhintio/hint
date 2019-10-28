import { Category } from '@hint/utils-types/dist/src/category';

import metas from '../../shared/metas.import';

/**
 * Returns a list with all the hint categories.
 */
export const getCategories = () => {
    return [...new Set(metas.map((meta) => {
        return (meta.docs && meta.docs.category || Category.other);
    }))].sort();
};
