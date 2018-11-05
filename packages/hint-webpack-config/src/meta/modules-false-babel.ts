import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/modules-false-babel` warns against not having set the propety `modules` to `false` in presets in babel configuration file',
        name: 'Babel `modules` is `false` with webpack'
    },
    id: 'webpack-config/modules-false-babel',
    schema: [],
    scope: HintScope.local
};

export default meta;
