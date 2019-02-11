import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: 'Require web application name to be specified in the web app manifest file',
        name: 'Manifest has name'
    },
    id: 'manifest-app-name',
    schema: [],
    scope: HintScope.any
};

export default meta;
