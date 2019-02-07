import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

const meta: HintMetadata = {
    docs: {
        category: Category.security,
        description: 'This hint validates the `set-cookie` header and confirms that it is sent with `Secure` and `HttpOnly` directive over HTTPS.',
        name: 'Valid `Set-Cookie` header'
    },
    id: 'validate-set-cookie-header',
    ignoredConnectors: [],
    schema: [],
    scope: HintScope.site
};

export default meta;
