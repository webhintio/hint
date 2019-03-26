import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.pitfalls,
        description: `Inform users that they need to use createElementNS to create SVG elements instead of createElement`,
        name: 'No `createElement` with SVG'
    },
    id: 'create-element-svg',
    schema: [],
    scope: HintScope.any
};

export default meta;
