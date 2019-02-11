import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const schema = require('./compat-hint-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: 'Validate if CSS features used are deprecated in target browsers',
        name: 'Deprecated CSS features'
    },
    id: 'compat-api/css',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
