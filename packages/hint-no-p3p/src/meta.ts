import { Category, HintMetadata, HintScope } from 'hint';

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
