import { BrowserSupportCollection, BrowserSupportCollectionRaw, BrowserSupportItemRaw } from '../types';
import { convertBrowserSupportCollectionToMDN } from '.';

class UserBrowsers {
    public convert(targetedBrowsers: string[]): BrowserSupportCollection {
        const browserCollection = {} as BrowserSupportCollectionRaw;

        targetedBrowsers.forEach((browserInfo: string) => {
            const [browserName, browserVersion] = browserInfo.split(' ');

            if (browserCollection[browserName]) {
                browserCollection[browserName] = this.getNewMinMax(
                    browserCollection[browserName],
                    browserVersion
                );

                return;
            }

            browserCollection[browserName] = this.getMinMax(browserVersion);
        });

        return convertBrowserSupportCollectionToMDN(browserCollection);
    }

    private getMinMax(version: string): BrowserSupportItemRaw {
        return version.match(/-/) ?
            { max: version.split('-')[1], min: version.split('-')[0] } :
            { max: null, min: version };
    }

    private getNewMinMax(
        originalMinMax: BrowserSupportItemRaw,
        currVersion: string
    ): BrowserSupportItemRaw {
        if (currVersion.match(/-/)) {
            const earlierVersion = Number(currVersion.split('-')[0]);
            const laterVersion = Number(currVersion.split('-')[1]);

            /**
             * If a browser is listed twice, pick the lower or higher of the two.
             * e.g ['ios_saf 11.3-11.4','ios_saf 11.0-11.2'] yields {min: 11.0, max: 11.4}
             */
            return {
                max:
                    Number(originalMinMax.max) > laterVersion ?
                        originalMinMax.max :
                        currVersion.split('-')[1],
                min:
                    Number(originalMinMax.min) < earlierVersion ?
                        originalMinMax.min :
                        currVersion.split('-')[0]
            };
        }

        return {
            max:
                Number(originalMinMax.max) > Number(currVersion) ?
                    originalMinMax.max :
                    currVersion,
            min:
                Number(originalMinMax.min) < Number(currVersion) ?
                    originalMinMax.min :
                    currVersion
        };
    }
}

export const userBrowsers = new UserBrowsers();
