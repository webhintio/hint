import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const schema = require('./compat-hint-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: '`compat-api-css` validates if the CSS features of the project are deprecated',
        name: 'Compatibility CSS deprecated features'
    },
    id: 'compat-api/css',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
