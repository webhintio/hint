/**
 * @fileoverview Helper that contains all the logic related with HTML compat api, to use in different modules.
 */

import { MDNTreeFilteredByBrowsers, BrowserSupportCollection, HTMLTestFunction, BrowsersInfo, FeatureInfo } from '../types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ElementFound } from 'hint/dist/src/lib/types';
import { HTMLParse } from '../../../parser-html/dist/src/types';

export class CompatHTML {
    private testFunction: HTMLTestFunction;
    private hintContext: HintContext;
    private hintResource: string = 'unknown';

    public constructor(hintContext: HintContext, testFunction: HTMLTestFunction) {
        if (!testFunction) {
            throw new Error('You must set test function before test a feature.');
        }

        this.testFunction = testFunction;
        this.hintContext = hintContext;
    }

    public setResource(hintResource: string): void {
        this.hintResource = hintResource;
    }

    public async searchHTMLFeatures(data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, parse: HTMLParse): Promise<void> {
        console.log('skip unused variable ', this.hintResource);
        await this.walk(async (elementFound: ElementFound) => {
            await this.testFunction({} as BrowsersInfo, {} as FeatureInfo);
        });
    }

    private async walk(callback: (element: ElementFound) => any): Promise<void> {
        await this.hintContext.on('element::*', callback.bind(this));
    }
}
