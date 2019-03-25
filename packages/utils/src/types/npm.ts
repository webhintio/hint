/**
 * An user in a npm package.
 */
export type NpmMaintainer = {
    email: string;
    username: string;
};

/**
 * The result of a npm search.
 */
export type NpmPackage = {
    date: Date;
    description: string;
    keywords: string[];
    maintainers: NpmMaintainer[];
    name: string;
    version: string;
};

export type NpmPackageResult = {
    package: NpmPackage;
};

export type NpmSearchResults = {
    objects: NpmPackageResult[];
    total: number;
};
