/**
 * @fileoverview Hint to validate if the doctype is correct
 */

import * as os from 'os';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, FetchEnd, ProblemLocation } from 'hint/dist/src/lib/types';
import { MatchInformation } from './types';

import meta from './meta';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {
        const correctLine = 0;
        const doctypeRegExp = new RegExp(`(<!doctype\\s+(html)\\s*>)(.+)?`, 'gi');
        const doctypeFlexibleRegExp = new RegExp(`<[^>]*doctype[^<]*>`, 'gi');

        const defaultProblemLocation: ProblemLocation = {
            column: 0,
            line: 0
        };

        const report = (resource: string, message: string, location = defaultProblemLocation) => {
            context.report(resource, message, { location });
        };

        const getCurrentDoctypeProblemLocation = (text: string): ProblemLocation[] => {
            const lines = text.split(os.EOL);
            const locations: ProblemLocation[] = [];

            lines.forEach((line: string, i: number): void => {
                const matched = doctypeRegExp.exec(line);

                if (matched) {
                    locations.push({
                        column: matched.index,
                        line: i
                    });
                }
            });

            return locations;
        };

        const getMatchInformation = (text: string): MatchInformation => {
            return {
                locations: getCurrentDoctypeProblemLocation(text),
                matches: text.match(doctypeRegExp)
            };
        };

        const checkNoDoctypeInContent = (matchInfo: MatchInformation, resource: string, content: string): boolean => {
            if (matchInfo.matches && matchInfo.matches.length > 0) {
                return true;
            }

            if (!doctypeFlexibleRegExp.exec(content)) {
                report(resource, `'doctype' was not specified.`);

                return false;
            }

            report(resource, `'doctype' should be specified as '<!doctype html>'.`);

            return false;
        };

        const checkNoDoctypeInCorrectLine = (matchInfo: MatchInformation, resource: string) => {

            if (matchInfo.locations[0].line === correctLine) {
                return;
            }

            report(resource, `'doctype' should be specified before anything else.`, matchInfo.locations[0]);
        };

        const checkDoctypeIsDuplicated = (matchInfo: MatchInformation, resource: string) => {
            if (!matchInfo.matches || matchInfo.matches.length < 2) {
                return;
            }

            report(resource, `'doctype' is not needed as one was already specified.`, matchInfo.locations[matchInfo.locations.length - 1]);
        };

        const onFetchEndHTML = (fetchEnd: FetchEnd) => {
            const { resource, response } = fetchEnd;

            if (!response || !response.body || !response.body.content) {
                context.report(resource, 'Resource has no content.');

                return;
            }

            const { body } = response;
            const { content } = body;
            const contentTrimmed = content.trim();

            const globalMatch = getMatchInformation(contentTrimmed);

            if (!checkNoDoctypeInContent(globalMatch, resource, contentTrimmed)) {
                return;
            }

            checkNoDoctypeInCorrectLine(globalMatch, resource);
            checkDoctypeIsDuplicated(globalMatch, resource);

            return;
        };

        context.on('fetch::end::html', onFetchEndHTML);
    }
}
