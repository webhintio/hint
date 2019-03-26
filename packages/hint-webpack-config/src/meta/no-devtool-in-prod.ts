import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/no-devtool-in-prod` warns against having set the propety `devtool` to `eval`',
        name: 'No production `devtool` in webpack'
    },
    id: 'webpack-config/no-devtool-in-prod',
    schema: [],
    scope: HintScope.local
};

export default meta;
