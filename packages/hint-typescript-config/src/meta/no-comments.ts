import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`typescript-config/no-comments` checks if the property `removeComments` is enabled in the TypeScript configuration file (i.e `tsconfig.json`)',
        name: 'Enable remove comments in TypeScript configuration'
    },
    id: 'typescript-config/no-comments',
    schema: [],
    scope: HintScope.local
};

export default meta;
