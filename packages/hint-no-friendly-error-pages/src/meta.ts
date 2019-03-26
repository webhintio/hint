import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: 'Disallow small error pages',
        name: 'No small error pages'
    },
    id: 'no-friendly-error-pages',
    schema: [],
    scope: HintScope.site
};

export default meta;
