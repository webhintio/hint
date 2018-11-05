import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/config-exists` warns against not having a webpack configuration file',
        name: 'webpack configuration exists'
    },
    id: 'webpack-config/config-exists',
    schema: [],
    scope: HintScope.local
};

export default meta;
