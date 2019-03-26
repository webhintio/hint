import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: `This hint checks if the HTML is using the most modern DOCTYPE.`,
        name: 'Modern DOCTYPE'
    },
    id: 'doctype',
    schema: [],
    scope: HintScope.any
};

export default meta;
