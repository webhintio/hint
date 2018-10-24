import { BrowserSupportCollection, BrowserSupportCollectionRaw } from '../types';
import { convertBrowserSupportCollectionToMDN } from '.';

class UserBrowsers {
    public convert(targetedBrowsers: string[]): BrowserSupportCollection {
        const browserCollection = {} as BrowserSupportCollectionRaw;

        targetedBrowsers.forEach((browserInfo: string) => {
            const [browserName, browserVersion] = browserInfo.split(' ');

            browserCollection[browserName] = browserCollection[browserName] || [];
            browserCollection[browserName] = [...browserCollection[browserName], ...this.getBrowserVersions(browserVersion)]
        });

        return convertBrowserSupportCollectionToMDN(browserCollection);
    }

    private getBrowserVersions(version: string): string[] {
        // We support to have two versions in same targeted browser
        if (version.match(/-/)) {
            const [first, second] = version.split('-');
            return [first, second];
        }

        return [version];
    }
}

export const userBrowsers = new UserBrowsers();
