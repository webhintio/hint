import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from '../i18n.import';

const schema = require('./compat-hint-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.compatibility,
        description: getMessage('html_description', 'en'),
        name: getMessage('html_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('html_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('html_name', language);
    },
    id: 'compat-api/html',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
