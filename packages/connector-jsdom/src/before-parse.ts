/**
 * @fileoverview polyfills for jsdom.
 *
 */
import { URL } from 'url';
import * as vm from 'vm';
import * as path from 'path';

import * as jsdomutils from 'jsdom/lib/jsdom/living/generated/utils';

import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { DOMWindow } from 'jsdom';

export const beforeParse = (finalHref: string) => {
    return (window: DOMWindow) => {
        const mutationObserverPolyfill = readFile(require.resolve('mutationobserver-shim'));
        const customElementsPolyfill = readFile(path.join(__dirname, 'polyfills', 'custom-elements.min.js'));

        const mutationScript: vm.Script = new vm.Script(mutationObserverPolyfill);
        const customElementsScript: vm.Script = new vm.Script(customElementsPolyfill);

        mutationScript.runInContext(jsdomutils.implForWrapper(window.document)._global);
        customElementsScript.runInContext(jsdomutils.implForWrapper(window.document)._global);

        window.document.domain = new URL(finalHref).host;

        /* istanbul ignore next */
        window.matchMedia = () => {
            return { addListener() { } } as any;
        };

        Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientWidth', { value: 1024 });
        Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientHeight', { value: 768 });
    };
};
