// Waiting for this PR https://github.com/mdn/browser-compat-data/pull/3004
const bcd = require('mdn-browser-compat-data');
import { forEach } from 'lodash';
type CompatNamespace = 'css' | 'javascript' | 'html';

export class CompatApi {
    private compatData: any; // Any because no types by the moment

    constructor(namespaceName: CompatNamespace, private browsers: any /* Isabella PR */) {
        this.compatData = bcd[namespaceName];
        this.compatData = this.applyBrowsersConfiguration();
    }

    private applyBrowsersConfiguration(): any {
        const compatData = {} as any;
        forEach(this.compatData, (apiTypeValue, apiTypeKey) => {
            const apiType = {} as any;
            forEach(apiTypeValue, (propertyValue, propertyKey) => {
                if (!this.apiPropertyIsRequired(propertyValue)) {
                    return;
                }

                apiType[propertyKey] = propertyValue;
            });
            compatData[apiTypeKey] = apiType;
        });

        return compatData;
    }

    private apiPropertyIsRequired(propertyValue: any /* waiting types */): boolean {
        // TODO: Here we are checking only parent but this object has children

        let isRequired = true;
        forEach(this.browsers, (values, browser) => {
            if (!isRequired || !propertyValue.__compat || !propertyValue.__compat.support) {
                return;
            }

            const propertySupport = propertyValue.__compat.support[browser];

            if (!propertySupport) {
                isRequired = false;
                return;
            }

            const version = propertySupport.version_added;
            isRequired = !!version
                && version === true
                || !isNaN(parseFloat(version)) && (version >= values.min && version <= (values.max || Infinity));
        });

        return isRequired;
    }
}
