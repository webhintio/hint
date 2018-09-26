/* eslint sort-keys: 0 */

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const metaCharset = '<mEtA CHaRseT="UtF-8">';
const metaHttpEquiv = '<MeTa HTTP-EquiV="ConTent-Type" Content="TexT/HTML; CharSet=UtF-8">';

const metaElementCanBeShorterErrorMessage = `'charset' meta element should be specified using shorter '<meta charset="utf-8">' form.`;
const metaElementHasIncorrectValueErrorMessage = `'charset' meta element value should be 'utf-8', not 'utf8'.`;
const metaElementIsNotFirstInHeadErrorMessage = `'charset' meta element should be the first thing in '<head>'.`;
const metaElementIsNotInHeadErrorMessage = `'charset' meta element should be specified in the '<head>', not '<body>'.`;
const metaElementIsNotNeededErrorMessage = `'charset' meta element is not needed as one was already specified.`;
const metaElementNotSpecifiedErrorMessage = `'charset' meta element was not specified.`;

const tests: Array<HintTest> = [
    {
        name: `'charset' meta element is not specified`,
        reports: [{ message: metaElementNotSpecifiedErrorMessage }],
        serverConfig: generateHTMLPage()
    },
    {
        name: `'http-equiv' meta element is specified`,
        reports: [{ message: metaElementCanBeShorterErrorMessage }],
        serverConfig: generateHTMLPage(metaHttpEquiv)
    },
    {
        name: `'charset' meta element is specified with a value different then 'utf-8'`,
        reports: [{ message: metaElementHasIncorrectValueErrorMessage }],
        serverConfig: generateHTMLPage('<meta charset="utf8">')
    },
    {
        name: `'charset' meta element is specified with the value of 'utf-8'`,
        serverConfig: generateHTMLPage(metaCharset)
    },
    {
        name: `'charset' meta element is specified in the '<body>'`,
        reports: [
            { message: metaElementIsNotFirstInHeadErrorMessage },
            { message: metaElementIsNotInHeadErrorMessage }
        ],
        serverConfig: generateHTMLPage(null, metaCharset)
    },
    {
        name: `'charset' meta element is specified in '<head>' after another element`,
        reports: [{ message: metaElementIsNotFirstInHeadErrorMessage }],
        serverConfig: generateHTMLPage('<title>test</title><meta charset="utf-8">')
    },
    {
        name: `'charset' meta element is specified in '<head>' after an HTML comment`,
        reports: [{ message: metaElementIsNotFirstInHeadErrorMessage }],
        serverConfig: generateHTMLPage('<!-- test --><meta charset="utf-8">')
    },
    {
        name: `Multiple meta 'charset' elements are specified`,
        reports: [{ message: metaElementIsNotNeededErrorMessage }],
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
        reports: [{ message: metaElementIsNotFirstInHeadErrorMessage }],
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
     *                 { message: metaElementNotSpecifiedErrorMessage },
     *                 { message: `Unneeded XML declaration: '<?xml version="1.0" encoding="ISO-8859-1"?>'.` }
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

hintRunner.testHint(getHintPath(__filename), tests);
