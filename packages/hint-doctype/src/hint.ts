/**
 * @fileoverview Hint to validate if the doctype is correct
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, FetchEnd, ProblemLocation } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { MatchInformation } from './types';

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
            description: `This hint checks if the HTML is using the most modern DOCTYPE.`
        },
        id: 'doctype',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const regExpFactory = (isFlexible = false) => {
            return new RegExp(`(<!doctype\\s+(html)\\s*(\\s+system\\s+"about:legacy-compat")?\\s*?>)${isFlexible ? '(.+)?' : ''}`, 'gi');
        };

        const correctLine = 0;
        const doctypeRegExp = regExpFactory();
        const doctypeRegExpFlexible = regExpFactory(true);

        const defaultProblemLocation: ProblemLocation = {
            column: 0,
            line: 0
        };

        const report = async (resource: string, message: string, problemLocation = defaultProblemLocation): Promise<void> => {
            await context.report(resource, null, message, undefined, problemLocation);
        };

        const getCurrentDoctypeProblemLocation = (text: string): ProblemLocation => {
            const lines = text.split('\n');
            const location = defaultProblemLocation;
            let found = false;

            lines.forEach((line: string, i: number): void => {
                if (found) {
                    return;
                }

                const matched = doctypeRegExpFlexible.exec(line);

                if (matched){
                    found = true;
                    location.line = i;
                    location.column = matched.index;
                }
            });

            return location;
        };

        const getMatchInformation = (text: string): MatchInformation => {
            return {
                location: getCurrentDoctypeProblemLocation(text),
                matches: text.match(doctypeRegExpFlexible)
            };
        };

        const checkNoDoctypeInContent = async (matchInfo: MatchInformation, resource: string): Promise<boolean> => {
            if (matchInfo.matches && matchInfo.matches.length > 0) {
                return true;
            }

            await report(resource, 'The resource does not contain a valid DOCTYPE.');

            return false;
        };

        const checkNoDoctypeInCorrectLine = async (matchInfo: MatchInformation, resource: string): Promise<void> => {
            if (matchInfo.location.line === correctLine) {
                return;
            }

            await report(resource, 'DOCTYPE is not in the first line.', matchInfo.location);
        };

        const checkDoctypeHasMoreThanValidInfo = async (matchInfo: MatchInformation, resource: string): Promise<void> => {
            if (!matchInfo.matches || matchInfo.matches.length < 1) {
                return;
            }

            const matchedDoctype = matchInfo.matches[0];
            const strictMatch = matchedDoctype.match(doctypeRegExp);

            if (!strictMatch || strictMatch.length < 1) {
                return;
            }

            if (strictMatch[0] === matchedDoctype) {
                return;
            }

            await report(resource, 'There is additional information on the line with the DOCTYPE.');
        };

        const checkDoctypeIsDuplicated = async (matchInfo: MatchInformation, resource: string): Promise<void> => {
            if (!matchInfo.matches || matchInfo.matches.length < 2) {
                return;
            }

            await report(resource, 'There is more than one DOCTYPE in the document.', matchInfo.location);

        };

        const onFetchEndHTML = async (fetchEnd: FetchEnd): Promise<void> => {
            const { resource, response } = fetchEnd;

            if (!response || !response.body || !response.body.content) {
                await context.report(resource, null, 'Resource has no content.', undefined);

                return;
            }

            const { body } = response;
            const { content } = body;

            const globalMatch = getMatchInformation(content);

            if (!checkNoDoctypeInContent(globalMatch, resource)) {
                return;
            }

            checkNoDoctypeInCorrectLine(globalMatch, resource);
            checkDoctypeHasMoreThanValidInfo(globalMatch, resource);
            checkDoctypeIsDuplicated(globalMatch, resource);
        };

        context.on('fetch::end::html', onFetchEndHTML);
    }
}
