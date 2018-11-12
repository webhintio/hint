/**
 * @fileoverview Helper to get the versions of browsers.
 */

import { BrowserSupportCollection } from '../types';
import { convertBrowserSupportCollectionToMDN } from '.';
import { browserVersions } from './normalize-version';

class UserBrowsers {
    public convert(targetedBrowsers: string[]): BrowserSupportCollection {
        const browserCollection = {} as BrowserSupportCollection;

        targetedBrowsers.forEach((browserInfo: string) => {
            const [browserName, browserVersion] = browserInfo.split(' ');

            browserCollection[browserName] = browserCollection[browserName] || [];
            browserCollection[browserName] = [...browserCollection[browserName], ...this.getBrowserVersions(browserVersion)];
        });

        return convertBrowserSupportCollectionToMDN(browserCollection);
    }

    private getBrowserVersions(version: string): number[] {
        // We support to have two versions in same targeted browser
        if (version.match(/-/)) {
            const [first, second] = version.split('-');

            return [browserVersions.normalize(first), browserVersions.normalize(second)];
        }

        return [browserVersions.normalize(version)];
    }
}

export const userBrowsers = new UserBrowsers();
