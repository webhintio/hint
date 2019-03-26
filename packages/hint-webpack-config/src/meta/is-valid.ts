import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/is-valid` warns against providing an invalid webpack configuration file `webpack.config.js`',
        name: 'Valid webpack configuration'
    },
    id: 'webpack-config/is-valid',
    schema: [],
    scope: HintScope.local
};

export default meta;
