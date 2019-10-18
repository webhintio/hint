import * as vm from 'vm';

import { JSDOM, VirtualConsole } from 'jsdom';
import * as jsdomutils from 'jsdom/lib/jsdom/living/generated/utils';

import { debug as d } from '@hint/utils';
import { Requester } from '@hint/utils-connector-tools';

import { beforeParse } from './before-parse';
import { NetworkData } from 'hint';
import { EvaluateCustomResourceLoader } from './evaluate-resource-loader';

const debug: debug.IDebugger = d(__filename);

const run = async (data: { options: any; source: string }) => {
    const { options = {}, source } = data;
    const requesterOptions = {
        rejectUnauthorized: !options.ignoreHTTPSErrors,
        strictSSL: !options.ignoreHTTPSErrors,
        ...options.requestOptions
    };

    const requester = new Requester(requesterOptions);

    const result = {
        error: null as Error | null,
        evaluate: 'result'
    };
    const url = process.argv[2];
    const waitFor = parseInt(process.argv[3], 10);

    const virtualConsole = new VirtualConsole();

    virtualConsole.on('error', (err: Error) => {
        debug(err);
    });

    virtualConsole.on('jsdomError', (err: Error) => {
        debug(err);
    });

    let html = '';
    let networkData: NetworkData;

    try {
        /*
         * we need to request the HTML separately instead of
         * just using `JSDOM.fromURL` in order to respect
         * user options to ignore HTTPS errors.
         */
        networkData = await requester.get(url);

        html = networkData.response.body.content;
    } catch (error) {
        process.send!({ error });

        return;
    }
    const finalUrl = networkData.response.url;

    const jsdom = new JSDOM(html, {
        beforeParse: beforeParse(finalUrl),
        pretendToBeVisual: true,
        resources: new EvaluateCustomResourceLoader(requesterOptions, finalUrl),
        runScripts: 'dangerously',
        url: finalUrl,
        virtualConsole
    });

    const onLoad = () => {
        /*
         * Even though `onLoad()` is called on `window.onload`
         * (so all resoruces and scripts executed), we might want
         * to wait a few seconds if the site is lazy loading something.
         */
        return setTimeout(async () => {
            try {
                const script: vm.Script = new vm.Script(source);
                const evaluteResult = await script.runInContext(jsdomutils.implForWrapper(jsdom.window.document)._global);

                result.evaluate = evaluteResult;
            } catch (err) {
                result.error = err;
            }

            process.send!(result);
        }, waitFor);
    };

    const onError = (error: ErrorEvent) => {
        debug(`onError: ${error}`);
    };

    jsdom.window.addEventListener('load', onLoad, { once: true });
    jsdom.window.addEventListener('error', onError);
};

process.on('message', run);
