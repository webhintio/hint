import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from './i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.accessibility,
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
    id: 'axe',
    schema: [{
        additionalProperties: false,
        properties: {
            rules: {
                patternProperties: {
                    '^.+$': {
                        additionalProperties: false,
                        properties: { enabled: { type: 'boolean' } },
                        required: ['enabled'],
                        type: 'object'
                    }
                },
                type: 'object'
            },
            runOnly: {
                additionalProperties: false,
                properties: {
                    type: { type: 'string' },
                    values: {
                        items: { type: 'string' },
                        minItems: 1,
                        type: 'array',
                        uniqueItems: true
                    }
                },
                type: 'object'
            }
        }
    }],
    /*
     * axe can not analyze a file itself, it needs a connector.
     */
    scope: HintScope.any
};

export default meta;
