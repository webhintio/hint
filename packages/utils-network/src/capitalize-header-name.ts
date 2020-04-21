import { toPascalCase } from '@hint/utils-string';

/**
 * Capitalize a header name.
 *
 * e.g:
 *   content-type => Content-Type
 */
export const capitalizeHeaderName = (headerName: string) => {
    const parts = headerName.split('-').map((partialName) => {
        return toPascalCase(partialName);
    });

    return parts.join('-');
};
