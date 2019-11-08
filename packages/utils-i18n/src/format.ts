/**
 * Format a string appliying substitutions if there is any.
 *
 * e.g. Calling
 * format('scanning url $1', 'https://example.com')
 *
 * will return:
 *
 * scanning url https://example.com
 *
 * This method is going to be shared whith the HTML formatter.
 * Please, do not update to an array function to ensure browsers support it.
 * @param {string} text Text to format
 * @param {string | string[] | undefined} substitutions Substitutions to apply to the text
 */
/* eslint-disable no-var, prefer-arrow-callback */
export var format = function (text: string, substitutions?: string | string[]): string {
    if (typeof substitutions === 'undefined') {
        return text;
    }
    var substs = Array.isArray(substitutions) ? substitutions : [substitutions];
    var substitutionsRegex = /(\$(\d+))|(\${2,})/g;
    var result = text.replace(substitutionsRegex, function (fullMatch: string, substitution: string, substitutionIndex: string, dollarSymbols: string) {
        if (typeof substitutionIndex !== 'undefined') {
            return substs[parseInt(substitutionIndex, 10) - 1];
        }
        if (typeof dollarSymbols !== 'undefined') {
            return ''.padStart(dollarSymbols.length - 1, '$');
        }

        return fullMatch;
    });

    return result;
};
