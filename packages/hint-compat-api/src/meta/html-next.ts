import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const schema = require('./compat-hint-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: 'Validate if HTML features used are supported in target browsers',
        name: 'New HTML features'
    },
    id: 'compat-api/html-next',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
