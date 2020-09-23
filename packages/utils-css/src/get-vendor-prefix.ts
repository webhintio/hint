/**
 * Returns the vendor prefix from an string.
 * NOTE: This code is extracted from the package postcss because
 * they have removed this features from their code.
 * @param {string} prop Property to extract the prefix.
 * @returns {string} The prefix in the property.
 */
export const getVendorPrefix = (prop: string): string => {
    const match = prop.match(/^(-\w+-)/);

    if (match) {
        return match[0];
    }

    return '';
};
