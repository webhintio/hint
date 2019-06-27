import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from '../i18n.import';

const schema = require('./compat-hint-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: getMessage('css/description', 'en'),
        name: getMessage('css/name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('css/description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('css/name', language);
    },
    id: 'compat-api/css',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
