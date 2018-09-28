/**
 * Remove whitespace from both ends of a string and lowercase it.
 *  If `defaultValue` is provided, it will return it if the return
 *  value would be `null`.
 */
export default (value: string | null | undefined, defaultValue?: string): string | null => {
    if (typeof value === 'undefined' || value === null) {
        return typeof defaultValue !== 'undefined' ? defaultValue : null;
    }

    return value.toLowerCase().trim();
};
