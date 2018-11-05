import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/is-installed` warns against not having webpack installed',
        name: 'webpack is installed'
    },
    id: 'webpack-config/is-installed',
    schema: [],
    scope: HintScope.local
};

export default meta;
