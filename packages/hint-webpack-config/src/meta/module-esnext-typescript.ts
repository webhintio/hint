import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`webpack-config/module-esnext-typescript` warns against not having set the propety `compilerOptions.module` to `esnext` in typescript configuration file',
        name: 'webpack compatible TypeScript `module`'
    },
    id: 'webpack-config/module-esnext-typescript',
    schema: [],
    scope: HintScope.local
};

export default meta;
