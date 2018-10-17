/**
 * @fileoverview Hint to validate if the doctype is correct
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, FetchEnd, ProblemLocation } from 'hint/dist/src/lib/types';
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
            description: `Hint to validate if the DOCTYPE is correct.`
        },
        id: 'doctype',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const doctypeRegExp = /(<!doctype\s+(html)\s*(\s+system\s+"about:legacy-compat")?\s*?>)(.+)?/gi;
        const defaultProblemLocation: ProblemLocation = {
            column: 0,
            line: 0
        };

        const getCurrentProblemLocation = (content: string): ProblemLocation => {
            const lines = content.split('\n');
            const location = {} as ProblemLocation;

            lines.forEach((line: string, i: number): void => {
                const matched = doctypeRegExp.exec(line);

                if (matched && !location.line){
                    location.line = i;
                    location.column = matched.index;
                }
            });

            return location;
        };

        const checkDoctypeIsValid = async (resource: string, content: string): Promise<boolean> => {
            debug(`Checking if the DOCTYPE is valid.`);

            const matched = content.match(doctypeRegExp);

            if (!matched || matched.length < 1) {
                await context.report(resource, null, `The resource does not contain a valid DOCTYPE.`, undefined, defaultProblemLocation);

                return false;
            }

            return true;
        };

        const checkDoctypeFirstLine = async (resource: string, content: string): Promise<void> => {
            debug(`Checking if the DOCTYPE is in the first line.`);

            const firstLine = content.split(/\r|\n/)[0];
            const matched = firstLine.match(doctypeRegExp);
            const doctypeRegExpStrict = /(<!doctype\s+(html)\s*(\s+system\s+"about:legacy-compat")?\s*?>)/gi;


            if (!matched || matched.length < 1) {
                // DOCTYPE is not found in the first line
                const globalMatched = content.match(doctypeRegExp);
                let problemLocation = defaultProblemLocation;

                if (!globalMatched || globalMatched.length < 1) {
                    // DOCTYPE was not found in first line or anywhere else in the document
                    await context.report(resource, null, `DOCTYPE is not in the first line.`, undefined, problemLocation);

                    return;
                }

                // DOCTYPE was found somewhere else in the document
                problemLocation = getCurrentProblemLocation(content);
                await context.report(resource, null, `DOCTYPE was found somewhere else other than the first line.`, undefined, problemLocation);

                return;
            }

            if (matched) {
                // Check for additional info on first line e.g. `<!doctype html></br>`
                const cleaned = firstLine.match(doctypeRegExpStrict);

                if (cleaned && !(cleaned[0] === matched[0])) {
                    await context.report(resource, null, `There is additional information on the line with the DOCTYPE tag.`, undefined, defaultProblemLocation);

                    return;
                }
            }
        };

        const checkNoDuplicateDoctype = async (resource: string, content: string): Promise<void> => {
            debug(`Checking that there is only one DOCTYPE tag in the document.`);

            const matched = content.match(doctypeRegExp);

            if (matched && matched.length > 1) {
                const problemLocation = getCurrentProblemLocation(content);

                await context.report(resource, null, `There is more than one DOCTYPE tag in the document.`, undefined, problemLocation);

                return;
            }
        };

        const onFetchEndHTML = async (fetchEnd: FetchEnd): Promise<void> => {
            const { resource, response } = fetchEnd;

            if (!response || !response.body || !response.body.content) {
                await context.report(resource, null, 'Resource has no content.', undefined, defaultProblemLocation);

                return;
            }

            const { body } = response;
            const { content } = body;

            // If doctype is not valid, do not run more tests
            if (!await checkDoctypeIsValid(resource, content)) {
                return;
            }

            await checkDoctypeFirstLine(resource, content);
            await checkNoDuplicateDoctype(resource, content);
        };

        context.on('fetch::end::html', onFetchEndHTML);
    }
}
