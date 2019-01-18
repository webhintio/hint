import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: `Don't use P3P related headers or meta tags`,
        name: 'No `P3P` headers'
    },
    id: 'no-p3p',
    schema: [],
    scope: HintScope.site
};

export default meta;
