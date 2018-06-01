/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const metaCharset = '<mEtA CHaRseT="UtF-8">';
const metaHttpEquiv = '<MeTa HTTP-EquiV="ConTent-Type" Content="TexT/HTML; CharSet=UtF-8">';

const tests: Array<RuleTest> = [
    {
        name: `'charset' meta tag is not specified`,
        reports: [{ message: `No charset meta tag was specified` }],
        serverConfig: generateHTMLPage()
    },
    {
        name: `'http-equiv' meta tag is specified`,
        reports: [{ message: `Use shorter '<meta charset="utf-8">'` }],
        serverConfig: generateHTMLPage(metaHttpEquiv)
    },
    {
        name: `'charset' meta tag is specified with a value different then 'utf-8'`,
        reports: [{ message: `The value of 'charset' is not 'utf-8'` }],
        serverConfig: generateHTMLPage('<meta charset="utf8">')
    },
    {
        name: `'charset' meta tag is specified with the value of 'utf-8'`,
        serverConfig: generateHTMLPage(metaCharset)
    },
    {
        name: `'charset' meta tag is specified in the '<body>'`,
        reports: [
            { message: `Charset meta tag should be the first thing in '<head>'`},
            { message: `Meta tag should not be specified in the '<body>'`}
        ],
        serverConfig: generateHTMLPage(null, metaCharset)
    },
    {
        name: `'charset' meta tag is specified in '<head>' after another tag`,
        reports: [{ message: `Charset meta tag should be the first thing in '<head>'` }],
        serverConfig: generateHTMLPage('<title>test</title><meta charset="utf-8">')
    },
    {
        name: `'charset' meta tag is specified in '<head>' after an HTML comment`,
        reports: [{ message: `Charset meta tag should be the first thing in '<head>'` }],
        serverConfig: generateHTMLPage('<!-- test --><meta charset="utf-8">')
    },
    {
        name: `Multiple meta 'charset' tags are specified`,
        reports: [{ message: 'A charset meta tag was already specified' }],
        serverConfig: generateHTMLPage(`${metaCharset}${metaHttpEquiv}`)
    },
    {
        name: `Target is not served with a valid media type`,
        serverConfig: { '/': { headers: { 'Content-Type': 'invalid' } } }
    },
    {
        name: `Target is served with a non-HTML specific media type`,
        serverConfig: { '/': { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } } }
    },
    {
        name: `Content is injected before meta 'charset' after load should pass`,
        serverConfig: generateHTMLPage(`${metaCharset}
        <script>
            var meta = document.querySelector('meta');
            for(var i = 0; i < 10; i++){
                const script = document.createElement('script');
                meta.parentNode.insertBefore(script, meta);
            }
        </script>`)
    },
    {
        name: `Meta 'charset' is injected after load, should fail`,
        reports: [{ message: `Charset meta tag should be the first thing in '<head>'` }],
        serverConfig: generateHTMLPage(`<title>No charset</title>
        <script>
            var head = document.querySelector('head');
            var meta = document.createElement('meta');
            var title = document.querySelector('title');
            meta.setAttribute('charset', 'utf-8');
            head.insertBefore(meta, title);
        </script>`)
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }

    /*
     * TODO: Enable it once `jsdom` returns the correct content.
     *     {
     *         name: `The XML charset declaration is used'`,
     *             reports: [
     *                 { message: 'No charset meta tag was specified' },
     *                 { message: `Unneeded XML declaration: '<?xml version="1.0" encoding="ISO-8859-1"?>'` }
     *             ],
     *             serverConfig:
     * `<?xml version="1.0" encoding="ISO-8859-1"?>
     * <!doctype html>
     * <html lang="en">
     *     <head>
     *         <title>test</title>
     *     </head>
     *     <body></body>
     * </html>`
     *     }
     */
];

ruleRunner.testRule(getRuleName(__dirname), tests);
