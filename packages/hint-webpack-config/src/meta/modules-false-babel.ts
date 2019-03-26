import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/modules-false-babel` warns against not having set the propety `modules` to `false` in presets in babel configuration file',
        name: 'No Babel `modules` with webpack'
    },
    id: 'webpack-config/modules-false-babel',
    schema: [],
    scope: HintScope.local
};

export default meta;
