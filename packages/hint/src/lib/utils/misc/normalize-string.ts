/**
 * Remove whitespace from both ends of a string and lowercase it.
 *  If `defaultValue` is provided, it will return it if the return
 *  value would be `null`.
 */
export default (value: string, defaultValue?: string): string => {
    if (typeof value === 'undefined' || value === null) {
        return typeof defaultValue !== 'undefined' ? defaultValue : null;
    }

    return value.toLowerCase().trim();
};
