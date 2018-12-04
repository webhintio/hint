import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { HTMLParse, HTMLEvents } from '@hint/parser-html/dist/src/types';
import { CompatApi, userBrowsers, CompatHTML } from './helpers';
import { BrowserSupportCollection, FeatureInfo, BrowsersInfo } from './types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default abstract class BaseCompatApiHTML implements IHint {
    private mdnBrowsersCollection: BrowserSupportCollection;
    private compatApi: CompatApi;
    private compatHTML: CompatHTML;

    public constructor(context: HintContext<HTMLEvents>, isCheckingNotBroadlySupported: boolean) {
        this.mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        this.compatApi = new CompatApi('html', this.mdnBrowsersCollection, isCheckingNotBroadlySupported);
        this.compatHTML = new CompatHTML(context, this.testFeatureIsSupportedInBrowser.bind(this));

        context.on('parse::end::html', this.onParseHTML.bind(this));
    }

    private async onParseHTML(htmlParse: HTMLParse): Promise<void> {
        const { resource } = htmlParse;

        this.compatHTML.setResource(resource);
        await this.compatHTML.searchHTMLFeatures(this.compatApi.compatDataApi, this.mdnBrowsersCollection, htmlParse);
    }

    private async testFeatureIsSupportedInBrowser(browser: BrowsersInfo, feature: FeatureInfo): Promise<void> {
    }
}
