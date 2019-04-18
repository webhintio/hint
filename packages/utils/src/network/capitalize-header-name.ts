import { toPascalCase } from '../misc/to-pascal-case';

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
