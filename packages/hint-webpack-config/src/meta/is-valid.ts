import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/is-valid` warns against providing an invalid webpack configuration file `webpack.config.js`',
        name: 'webpack configuration is valid'
    },
    id: 'webpack-config/is-valid',
    schema: [],
    scope: HintScope.local
};

export default meta;
