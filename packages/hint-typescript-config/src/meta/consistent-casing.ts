import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`typescript-config/consistent-casing` checks if the property `forceConsistentCasingInFileNames` is enabled in the TypeScript configuration file (i.e `tsconfig.json`)',
        name: 'TypeScript consistent casing'
    },
    id: 'typescript-config/consistent-casing',
    schema: [],
    scope: HintScope.local
};

export default meta;
