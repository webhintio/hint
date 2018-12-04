import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`compat-api-html` validates if the HTML features of the project are deprecated',
        name: 'Compatibility HTML deprecated features'
    },
    id: 'compat-api-html',
    schema: [],
    scope: HintScope.any
};

export default meta;
