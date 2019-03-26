import { Category, HintMetadata, HintScope } from 'hint';

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
