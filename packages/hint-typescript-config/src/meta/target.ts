import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`typescript-config/target` warns against providing a `compilerOptions.target` in the TypeScript configuration file (i.e `tsconfig.json`) not optimized for the defined `browserslist` values.',
        name: 'TypeScript target'
    },
    id: 'typescript-config/target',
    schema: [],
    scope: HintScope.local
};

export default meta;
