import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`typescript-config/strict` checks if the property `strict` is enabled in the TypeScript configuration file (i.e `tsconfig.json`).',
        name: 'TypeScript strict'
    },
    id: 'typescript-config/strict',
    schema: [],
    scope: HintScope.local
};

export default meta;
