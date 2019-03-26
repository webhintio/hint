import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: 'Require a web app manifest',
        name: 'Has web app manifest'
    },
    id: 'manifest-exists',
    schema: [],
    scope: HintScope.any
};

export default meta;
