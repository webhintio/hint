/*
 * Note: This file cannot use any hint dependency in order to
 * keep simple compile it in webhint.io
 */

/*
 * ------------------------------------------------------------------------------
 * Utils
 * ------------------------------------------------------------------------------
 */

(function () {
    const linkify = function (msg: string) {
        const regex = /(https?:\/\/[a-zA-Z0-9.\\/?:@\-_=#]+\.[a-zA-Z0-9&.\\/?:@-_=#]*)\s[a-zA-Z]/g;
        /*
         *  Modified use of regular expression in https://stackoverflow.com/a/39220764
         * Should match:
         * jQuery@2.1.4 has 2 known vulnerabilities (1 medium, 1 low). See https://snyk.io/vuln/npm:jquery for more information.
         * AngularJS@1.4.9 has 3 known vulnerabilities (3 high). See https://snyk.io/vuln/npm:angular for more information.
         * Shouldn't match (shortened url):
         * File https://www.odysys.com/ … hedule-Your-Demo-Now.png could be around 37.73kB (78%) smaller.
         */
        const match = regex.exec(msg);

        if (!match) {
            return msg;
        }

        const urlMatch: string = match.pop() as string;
        const newMsg = msg.replace(urlMatch, `<a href="${urlMatch}">${urlMatch}</a>`);

        return newMsg;
    };

    const reverseString = (str: string) => {
        return str.split('').reverse()
            .join('');
    };

    const cutString = (str: string, maxLength: number) => {
        const minLength = 0.8 * maxLength;
        const preferredStopChars = /[^a-zA-Z0-9]/g;
        let chunk;

        for (let i = minLength; i < maxLength; i++) {
            // Start looking for preferred stop characters.
            if (preferredStopChars.test(str[i])) {
                chunk = str.slice(0, i);

                break;
            }
        }

        chunk = chunk || str.slice(0, maxLength);

        return chunk;
    };

    // Solution inspired by https://stackoverflow.com/a/10903003
    const shortenString = (string: string, maxLength: number) => {
        if (!string || string.length < maxLength * 2) {
            return string;
        }

        const headChunk = cutString(string, maxLength);
        const reverseTailChunk = cutString(reverseString(string), maxLength);
        const tailChunk = reverseString(reverseTailChunk);

        return `${headChunk} … ${tailChunk}`;
    };

    const cutCodeString = (codeString: string) => {
        return shortenString(codeString, 150);
    };

    const cutUrlString = (urlString: string) => {
        return shortenString(urlString, 25);
    };

    const normalizePosition = (position: string) => {
        if (!position || parseInt(position) === -1) {
            return '';
        }

        return `:${position}`;
    };

    const hintStatus = {
        pass: 'pass',
        pending: 'pending'
    };

    const noIssues = (caregory: any) => {
        return caregory.hints.every((hint: any) => {
            return hint.status === hintStatus.pass;
        });
    };

    const noPending = (category: any) => {
        return category.hints.every((hint: any) => {
            return hint.status !== hintStatus.pending;
        });
    };

    const filterErrorsAndWarnings = (category: any): Array<any> => {
        if (!category) {
            return [];
        }

        return category.hints.filter((hint: any) => {
            return hint.status !== hintStatus.pass;
        });
    };

    const utils = {
        cutCodeString,
        cutUrlString,
        filterErrorsAndWarnings,
        linkify,
        noIssues,
        noPending,
        normalizePosition
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = utils;
    } else {
        (window as any).utils = utils;
    }
}());
