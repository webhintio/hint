import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: `Ensures that required icons are specified in the web app manifest`,
        name: 'Manifest has icons'
    },
    id: 'manifest-icons',
    schema: [],
    scope: HintScope.site
};

export default meta;
