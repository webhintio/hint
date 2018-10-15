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
        const doctypeRegex = /(<!doctype ).+(>)(.+)?/;
        const doctypeRegexFactory = (flags?: string) => new RegExp('(<!doctype ).+(>)(.+)?', flags ? flags : 'g');

        const checkDoctypeIsValid = async (resource: string, element: IAsyncHTMLElement, content: string) => {
            debug(`Checking if the doctype is valid.`);

            const matched = content.match(doctypeRegexFactory('gi'));

            if (!matched || matched.length < 1) {
                await context.report(resource, element, `The file does not contain a doctype tag`);
                return;
            }

            const [contentDoctype] = matched;

            if (contentDoctype.toLowerCase() !== validDoctype) {
                await context.report(resource, element, `The doctype tag is not valid: ${contentDoctype}`);
                return;
            }

            return true;
        };

        const checkDoctypeFirstLine = async (resource: string, element: IAsyncHTMLElement, content: string) => {
            debug(`Checking if the doctype is in the first line.`);

            const firstLine = content.split(/\r|\n/)[0];
            const matched = firstLine.match(doctypeRegexFactory('gi'));

            if (!matched || matched.length < 1) {
                await context.report(resource, element, `The first line does not contain a valid doctype tag.`);
                return;
            }
        };

        const checkDoctypeLowercase = async (resource: string, element: IAsyncHTMLElement, content: string) => {
            debug(`Checking that the doctype is in lowercase`);

            const matched = content.match(doctypeRegexFactory())

            if (!matched) {
                await context.report(resource, element, `The doctype should be in lowercase`);
                return;
            }
        };

        const checkNoDuplicateDoctype = async (resource: string, element: IAsyncHTMLElement, content: string) => {
            debug(`Checking that there is only one doctype tag in the document`);

            const matched = content.match(doctypeRegexFactory('gi'))

            if (matched.length > 1) {
                await context.report(resource, element, `There is more than one doctype tag in the document`);
                return;
            }
        };

        const onFetchEndHTML = async (fetchEnd: FetchEnd) => {
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
            await checkDoctypeLowercase(resource, element, content);
            await checkNoDuplicateDoctype(resource, element, content);
        };

        context.on('fetch::end::html', onFetchEndHTML);
    }
}
