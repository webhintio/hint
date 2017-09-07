import * as vm from 'vm';

import * as jsdom from 'jsdom/lib/old-api';
import * as jsdomutils from 'jsdom/lib/jsdom/living/generated/utils';

const run = (data) => {
    const { source } = data;
    const result = {
        error: null,
        evaluate: 'result'
    };
    const url = process.argv[2];
    const waitFor = process.argv[3];

    jsdom.env({
        done: (error, window) => {
            if (error) {
                result.error = error;

                return process.send(result);
            }

            /* Even though `done()` is called after window.onload (so all resoruces and scripts executed),
                      we might want to wait a few seconds if the site is lazy loading something. */
            return setTimeout(async () => {
                try {
                    const script: vm.Script = new vm.Script(source);
                    const evaluteResult = await script.runInContext(jsdomutils.implForWrapper(window.document)._global);

                    result.evaluate = evaluteResult;
                } catch (err) {
                    result.error = err;
                }

                process.send(result);
            }, waitFor);
        },
        features: {
            FetchExternalResources: ['script', 'link', 'img'],
            ProcessExternalResources: ['script'],
            SkipExternalResources: false
        },
        url
    });
};

process.on('message', run);
