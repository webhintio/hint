import { Category, HintMetadata, HintScope } from 'hint';

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
