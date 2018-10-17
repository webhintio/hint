/**
 * @fileoverview Hint to validate if the doctype is correct
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, FetchEnd, IAsyncHTMLElement } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Hint to validate if the DOCTYPE is correct`
        },
        id: 'doctype',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const doctypeRegExp = /(<!doctype\s+(html)\s*(\s+system\s+"about:legacy-compat")?\s*?>)(.+)?/gi

        const checkDoctypeIsValid = async (resource: string, element: IAsyncHTMLElement | null, content: string): Promise<boolean> => {
            debug(`Checking if the DOCTYPE is valid.`);

            const matched = content.match(doctypeRegExp);

            if (!matched || matched.length < 1) {
                await context.report(resource, element, `The resource does not contain a valid DOCTYPE tag.`);

                return false;
            }

            return true;
        };

        const checkDoctypeFirstLine = async (resource: string, element: IAsyncHTMLElement | null, content: string): Promise<void> => {
            debug(`Checking if the DOCTYPE is in the first line.`);

            const firstLine = content.split(/\r|\n/)[0];
            const matched = firstLine.match(doctypeRegExp);
            const doctypeRegExpStrict = /(<!doctype\s+(html)\s*(\s+system\s+"about:legacy-compat")?\s*?>)/gi;


            if (!matched || matched.length < 1) {
                await context.report(resource, element, `The first line does not contain a valid DOCTYPE tag.`);

                return;
            }

            if (matched) {
                const cleaned = firstLine.match(doctypeRegExpStrict)

                if (cleaned && !(cleaned[0] === matched[0])) {
                    await context.report(resource, element, `There is additional information on the line with the DOCTYPE tag.`);

                    return
                }
            }
        };

        const checkNoDuplicateDoctype = async (resource: string, element: IAsyncHTMLElement | null, content: string): Promise<void> => {
            debug(`Checking that there is only one DOCTYPE tag in the document`);

            const matched = content.match(doctypeRegExp);

            if (matched && matched.length > 1) {
                await context.report(resource, element, `There is more than one doctype tag in the document`);

                return;
            }
        };

        const onFetchEndHTML = async (fetchEnd: FetchEnd): Promise<void> => {
            const { resource, element, response } = fetchEnd;

            if (!response || !response.body || !response.body.content) {
                await context.report(resource, element, 'Content has no body');

                return;
            }

            const { body } = response;
            const { content } = body;

            /*
             * If doctype is not valid, don not run more tests
             */
            if (!await checkDoctypeIsValid(resource, element, content)) {
                return;
            }

            await checkDoctypeFirstLine(resource, element, content);
            await checkNoDuplicateDoctype(resource, element, content);
        };

        context.on('fetch::end::html', onFetchEndHTML);
    }
}
