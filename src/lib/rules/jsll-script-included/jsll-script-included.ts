/**
 * @fileoverview This rule confirms that JSLL script is included in the page
 */
import { Category } from '../../enums/category';
import { RuleContext } from '../../rule-context';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IRule, IRuleBuilder, IElementFound, Severity } from '../../types';
import { isHTMLDocument, normalizeString } from '../../utils/misc';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        // Messages.
        const noScriptInHeadMsg = `No JSLL script was included in the <head> tag.`;
        const redundantScriptInHeadMsg = `More than one JSLL scripts were included in the <head> tag.`;
        const warningScriptVersionMsg = `Use the latest release of JSLL with 'jsll-4.js'. It is not recommended to specify the version number unless you wish to lock to a specific release.`;
        const invalidScriptVersionMsg = `The jsll script versioning is not valid.`;
        const wrongScriptOrderMsg = `The JSLL script isn't placed prior to other scripts.`;

        const jsllDir = `https://az725175.vo.msecnd.net/scripts/jsll-`;

        const isJsllScript = (element: IAsyncHTMLElement) => {
            const link = normalizeString(element.getAttribute('src'));

            return link.startsWith(jsllDir);
        };

        const getJsllScripts = (elements: Array<IAsyncHTMLElement>) => {
            return elements.filter((element) => {
                return isJsllScript(element);
            });
        };

        const validateHead = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            if (!isHTMLDocument(resource, context.pageHeaders)) {
                return;
            }

            const pageDOM: IAsyncHTMLDocument = context.pageDOM as IAsyncHTMLDocument;
            const scriptsInHead: Array<IAsyncHTMLElement> = await pageDOM.querySelectorAll('head script');
            const jsllScriptsInHead: Array<IAsyncHTMLElement> = getJsllScripts(scriptsInHead);

            if (!jsllScriptsInHead.length) {
                await context.report(resource, element, noScriptInHeadMsg);

                return;
            }

            if (jsllScriptsInHead.length > 1) {
                await context.report(resource, element, redundantScriptInHeadMsg);

                return;
            }

            const jsllScript: IAsyncHTMLElement = jsllScriptsInHead.pop();

            if (scriptsInHead.indexOf(jsllScript) !== 0) {
                await context.report(resource, element, wrongScriptOrderMsg);

                return;
            }
        };

        const validateLink = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;
            const passRegex = new RegExp(`^(\\d+\\.)js`); // 4.js
            const warningRegex = new RegExp(`^(\\d+\\.){2,}js`); // 4.2.1.js

            if (!isHTMLDocument(resource, context.pageHeaders) || !isJsllScript(element)) {
                return;
            }

            const fileName: string = normalizeString(element.getAttribute('src').replace(jsllDir, ''));

            if (passRegex.test(fileName)) {
                return;
            }

            if (warningRegex.test(fileName)) {
                await context.report(resource, element, warningScriptVersionMsg, null, null, Severity.warning);

                return;
            }

            await context.report(resource, element, invalidScriptVersionMsg);

            return;
        };

        return {
            'element::head': validateHead,
            'element::script': validateLink
        };
    },
    meta: {
        docs: {
            category: Category.performance,
            description: `This rule confirms that JSLL script is included in the head of the page`
        },
        recommended: false,
        schema: [],
        worksWithLocalFiles: false
    }
};

module.exports = rule;
