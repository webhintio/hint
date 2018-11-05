import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`typescript-config/target` warns against providing a `compilerOptions.target` in the TypeScript configuration file (i.e `tsconfig.json`) not optimized for the defined `browserslist` values.',
        name: 'Check if the TypeScript target is appropriate'
    },
    id: 'typescript-config/target',
    schema: [],
    scope: HintScope.local
};

export default meta;
