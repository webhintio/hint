/** A snyk.io library entry. */

export type Library = {
    name: string;
    version: string;
    npmPkgName: string;
};

/** A snyk.io vulnerability report. */

export type Vulnerability = {
    title: string;
    moduleName: string;
    language: string;
    packageManager: string;
    identifiers: any;
    severity: string;
    semver: any;
    vulnerable: string;
    credit: Array<string>;
    CVSSv3: string;
    disclosureTime: string; // Should be a date time, but we don't hydrate that from JSON.
    patches: Array<string>;
    publicationTime: string; // Should be a date time, but we don't hydrate that from JSON.
    modificationTime: string; // Should be a date time, but we don't hydrate that from JSON.
    creationTime: string; // Should be a date time, but we don't hydrate that from JSON.
    id: string;
    packageName: string;
    cvssScore: number;
    alternativeIds: Array<string>;
};
