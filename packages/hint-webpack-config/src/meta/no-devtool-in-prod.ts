import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

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
