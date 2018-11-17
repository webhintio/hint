import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.interoperability,
        description: `Warns against using the BOM (byte-order marker) character at the beginning of a text based file`,
        name: 'No byte-order mark'
    },
    id: 'no-bom',
    schema: [],
    scope: HintScope.any
};

export default meta;
