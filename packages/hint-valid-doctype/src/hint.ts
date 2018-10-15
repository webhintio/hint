/**
 * @fileoverview Hint to validate if the doctype is correct
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, FetchEnd, IAsyncHTMLElement, ResponseBody } from 'hint/dist/src/lib/types';
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
            description: `Hint to validate if the doctype is correct`
        },
        id: 'valid-doctype',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const validDoctype = '<!doctype html>';
        const doctypeRegex = /(<!doctype ).+(>).+/;

        const checkDoctypeFirstLine = async (resource: string, element: IAsyncHTMLElement, content: string) => {
            debug(`Checking if the doctype is in the first line, and there is nothing else.`);

            const firstLine = content.split(/\r|\n/)[0];
            const matched = firstLine.match(doctypeRegex);

            if (!matched || matched.length < 1) {
                await context.report(resource, element, `The first line does not contain a doctype.`);
                return;
            }

            const [contentDoctype] = matched;

            if (contentDoctype !== validDoctype) {
                await context.report(resource, element, `The first line contain more than a valid doctype ${contentDoctype}`);
            }
        };

        const onFetchEndHTML = async (fetchEnd: FetchEnd) => {
            const { resource, element, response } = fetchEnd;

            if (!response || !response.body || !response.body.content) {
                await context.report(resource, element, 'Content has no body.');
            }

            const { body } = response;
            const { content } = body;
            await checkDoctypeFirstLine(resource, element, content);
        };

        context.on('fetch::end::html', onFetchEndHTML);
    }
}
