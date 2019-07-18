import { Category, HintMetadata, HintScope } from 'hint';

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
    id: 'ssllabs',
    schema: [{
        additionalProperties: false,
        properties: {
            grade: {
                pattern: '^(A\\+|A\\-|[A-F]|T|M)$',
                type: 'string'
            },
            ssllabs: {
                properties: {
                    all: {
                        pattern: '^(on|done)$',
                        type: 'string'
                    },
                    fromCache: { type: 'boolean' },
                    ignoreMismatch: { type: 'boolean' },
                    maxAge: {
                        minimum: 0,
                        type: 'integer'
                    },
                    publish: { type: 'boolean' },
                    startNew: { type: 'boolean' }
                },
                type: 'object'
            }
        },
        type: 'object'
    }],
    scope: HintScope.site
};

export default meta;
