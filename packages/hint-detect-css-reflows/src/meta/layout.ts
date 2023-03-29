import { Category } from '@hint/utils-types';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from '../i18n.import';

const schema = require('./hint-detect-css-reflows-schema.json');

const meta: HintMetadata = {
    docs: {
        category: Category.performance,
        description: getMessage('layout_description', 'en'),
        name: getMessage('layout_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('layout_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('layout_name', language);
    },
    id: 'detect-css-reflows/layout',
    schema: [schema],
    scope: HintScope.any
};

export default meta;
