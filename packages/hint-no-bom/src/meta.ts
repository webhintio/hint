import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: `Warns against using the BOM (byte-order marker) character at the beginning of a text based file`,
        name: 'No byte-order mark'
    },
    id: 'no-bom',
    schema: [],
    scope: HintScope.any
};

export default meta;
