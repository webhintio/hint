import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`typescript-config/import-helpers` checks if the property `importHelpers` is enabled in the TypeScript configuration file (i.e `tsconfig.json`) to reduce the output size.',
        name: 'TypeScript import helpers'
    },
    id: 'typescript-config/import-helpers',
    schema: [],
    scope: HintScope.local
};

export default meta;
