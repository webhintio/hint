import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const schema = require('./compat-hint-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: '`compat-api-html` validates if the HTML features of the project are not broadly supported',
        name: 'Compatibility HTML not broadly supported features'
    },
    id: 'compat-api/html-next',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
