import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: `'babel-config/is-valid' warns against providing an invalid babel configuration file \`.babelrc\``,
        name: 'Valid Babel configuration'
    },
    id: 'babel-config/is-valid',
    schema: [],
    scope: HintScope.local
};

export default meta;
