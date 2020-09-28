/**
 * Returns the input property with the vendor prefix removed.
 * NOTE: This code is extracted from the package postcss because
 * they have removed this features from their code.
 * @param {string} prop Property to remove the prefix.
 * @returns {string} String without the vendor prefix.
 */
export const getUnprefixed = (prop: string): string => {
    return prop.replace(/^-\w+-/, '');
};
