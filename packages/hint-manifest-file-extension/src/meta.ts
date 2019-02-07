import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.pwa,
        description: 'Require `.webmanifest` as the file extension for the web app manifest file',
        name: 'Correct manifest extension'
    },
    id: 'manifest-file-extension',
    schema: [],
    scope: HintScope.any
};

export default meta;
