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
export const format = function (text: string, substitutions?: string | string[]): string {
    if (typeof substitutions === 'undefined') {
        return text;
    }
    const substs = Array.isArray(substitutions) ? substitutions : [substitutions];
    const substitutionsRegex = /(\$(\d+))|(\${2,})/g;
    const result = text.replace(substitutionsRegex, (fullMatch: string, substitution: string, substitutionIndex: string, dollarSymbols: string) => {
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
