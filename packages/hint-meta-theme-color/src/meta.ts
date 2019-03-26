import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: `Require a 'theme-color' meta element`,
        name: 'Valid `theme-color`'
    },
    id: 'meta-theme-color',
    schema: [],
    scope: HintScope.any
};

export default meta;
