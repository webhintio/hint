/**
 * @fileoverview polyfills for jsdom.
 *
 */
import { URL } from 'url';
import * as vm from 'vm';
import * as path from 'path';

import * as jsdomutils from 'jsdom/lib/jsdom/living/generated/utils';

import readFile from 'hint/dist/src/lib/utils/fs/read-file';

export const beforeParse = (finalHref) => {
    return (window) => {
        const mutationObserverPolyfill = readFile(path.resolve('node_modules', 'mutationobserver-shim', 'dist', 'mutationobserver.min.js'));
        const customElementsPolyfill = readFile(path.join(__dirname, 'polyfills', 'custom-elements.min.js'));

        const mutationScript: vm.Script = new vm.Script(mutationObserverPolyfill);
        const customElementsScript: vm.Script = new vm.Script(customElementsPolyfill);

        mutationScript.runInContext(jsdomutils.implForWrapper(window.document)._global);
        customElementsScript.runInContext(jsdomutils.implForWrapper(window.document)._global);

        window.document.domain = new URL(finalHref).host;
        window.matchMedia = () => {
            return {};
        };
        window.fetch = require('whatwg-fetch').fetch;

        Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientWidth', { value: 1024 });
        Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientHeight', { value: 768 });
    };
};
