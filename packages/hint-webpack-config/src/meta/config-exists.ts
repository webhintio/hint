import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/config-exists` warns against not having a webpack configuration file',
        name: 'Has webpack configuration'
    },
    id: 'webpack-config/config-exists',
    schema: [],
    scope: HintScope.local
};

export default meta;
