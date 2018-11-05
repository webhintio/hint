import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: `Verifies if a website is using HTTPS and if it has mixed content.`,
        name: 'Require HTTPS'
    },
    id: 'https-only',
    schema: [],
    scope: HintScope.site
};

export default meta;
