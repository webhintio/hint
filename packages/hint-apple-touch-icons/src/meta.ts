import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: `Require an 'apple-touch-icon'`,
        name: 'Use Apple touch icon'
    },
    id: 'apple-touch-icons',
    schema: [],
    scope: HintScope.any
};

export default meta;
