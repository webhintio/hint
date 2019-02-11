import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`typescript-config/is-valid` warns against providing an invalid TypeScript configuration file `tsconfig.json`',
        name: 'Valid TypeScript configuration'
    },
    id: 'typescript-config/is-valid',
    schema: [],
    scope: HintScope.local
};

export default meta;
