import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: `Require 'Strict-Transport-Security' header`,
        name: 'Use `Strict-Transport-Security` header'
    },
    id: 'strict-transport-security',
    schema: [{
        properties: {
            checkPreload: { type: 'boolean' },
            minMaxAgeValue: { type: 'number' }
        }
    }],
    scope: HintScope.site
};

export default meta;
