import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { Algorithms, OriginCriteria } from './types';
import { getMessage } from './i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: getMessage('description', 'en'),
        name: getMessage('name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('name', language);
    },
    id: 'sri',
    schema: [{
        additionalProperties: false,
        properties: {
            baseline: {
                enum: Object.keys(Algorithms).filter((key) => {
                    return isNaN(parseInt(key, 10));
                }),
                type: 'string'
            },
            originCriteria: {
                enum: Object.keys(OriginCriteria).filter((key) => {
                    return isNaN(parseInt(key, 10));
                }),
                type: 'string'
            }
        }
    }],
    scope: HintScope.any
};

export default meta;
