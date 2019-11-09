/**
 * Cut a given string adding ` … ` in the middle.
 * The default length is 50 characters.
 */
export const cutString = (txt: string, length: number = 50): string => {
    if (txt.length <= length) {
        return txt;
    }

    const partialLength: number = Math.floor(length - 3) / 2;

    return `${txt.substring(0, partialLength)} … ${txt.substring(txt.length - partialLength, txt.length)}`;
};
