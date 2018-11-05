import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: `Require 'X-Content-Type-Options' header`,
        name: 'Require `X-Content-Type-Options` header'
    },
    id: 'x-content-type-options',
    schema: [],
    scope: HintScope.site
};

export default meta;
