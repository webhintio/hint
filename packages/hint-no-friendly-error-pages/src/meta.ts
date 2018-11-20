import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.interoperability,
        description: 'Disallow small error pages',
        name: 'No small error pages'
    },
    id: 'no-friendly-error-pages',
    schema: [],
    scope: HintScope.site
};

export default meta;
