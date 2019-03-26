import { Category, HintMetadata, HintScope } from 'hint';

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
