import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/is-installed` warns against not having webpack installed',
        name: 'Has webpack'
    },
    id: 'webpack-config/is-installed',
    schema: [],
    scope: HintScope.local
};

export default meta;
