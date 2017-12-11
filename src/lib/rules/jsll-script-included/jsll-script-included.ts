/**
 * @fileoverview This rule confirms that JSLL script is included in the page
 */
import { Category } from '../../enums/category';
import { RuleContext } from '../../rule-context';
import { IAsyncHTMLElement, IRule, IRuleBuilder, IElementFound, ITraverseUp, ITraverseDown, Severity } from '../../types';
import { normalizeString } from '../../utils/misc';

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
        let isHead = false; // Flag to indicate if script is in head.
        let totalScriptCount = 0; // Total number of script tags in head.
        let jsllScriptCount = 0; // Total number of JSLL script tag in head.

        const isJsllScript = (element: IAsyncHTMLElement) => {
            const link = normalizeString(element.getAttribute('src'));

            return link.startsWith(jsllDir);
        };

        const isHeadElement = (element: IAsyncHTMLElement) => {
            return normalizeString(element.nodeName) === 'head';
        };

        const validateScript = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;
            const passRegex = new RegExp(`^(\\d+\\.)js`); // 4.js
            const warningRegex = new RegExp(`^(\\d+\\.){2,}js`); // 4.2.1.js

            if (!isHead) {
                return;
            }

            totalScriptCount += 1;

            if (!isJsllScript(element)) {
                return;
            }

            jsllScriptCount += 1;

            if (jsllScriptCount > 1) {
                await context.report(resource, element, redundantScriptInHeadMsg);

                return;
            }

            if (totalScriptCount > 1) {
                // There are other scripts in <head> prior to this JSLL script.
                await context.report(resource, element, wrongScriptOrderMsg);

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

        const traverseDown = (event: ITraverseDown) => {
            if (!isHeadElement(event.element)) {
                return;
            }

            isHead = true;
        };

        const traverseUp = async (event: ITraverseUp) => {
            const { resource }: { resource: string } = event;

            if (!isHeadElement(event.element)) {
                return;
            }

            if (jsllScriptCount === 0) {
                await context.report(resource, null, noScriptInHeadMsg);

                return;
            }

            isHead = false;
        };

        return {
            'element::script': validateScript,
            'traverse::down': traverseDown,
            'traverse::up': traverseUp
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
