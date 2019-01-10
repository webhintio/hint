import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const schema = require('./compat-hint-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.interoperability,
        description: '`compat-api-css` validates if the CSS features of the project are not broadly supported',
        name: 'Compatibility CSS not broadly supported features'
    },
    id: 'compat-api/css-next',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
