import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const schema = require('./compat-hint-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: 'Validate if HTML features used are deprecated in target browsers',
        name: 'Deprecated HTML features'
    },
    id: 'compat-api/html',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
