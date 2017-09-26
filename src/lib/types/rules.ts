import { Category } from '../enums/category';

export type MetadataDocs = {
<<<<<<< HEAD
    category: Category;
=======
    category?: Category;
>>>>>>> Chore: Create an `enum` for rule category.
    description: string;
};

export interface IRuleMetadata {
    /** Documentation related to the rule */
    docs?: MetadataDocs;
    /** List of connectors that should not run the rule */
    ignoredConnectors?: Array<string>;
    /** Use this rule to autogenerate the configuration file */
    recommended?: boolean;
    /** The schema the rule configuration must follow in order to be valid */
    schema: Array<any>; // TODO: this shouldn't be an Array of any
    /** If the rule works with local resources (file://...) */
    worksWithLocalFiles: boolean;
}

/** The builder of a given Rule */
export interface IRuleBuilder {
    /** Creates an instance of the rule. */
    create(config: Object): IRule;
    /** The metadata associated to the rule (docs, schema, etc.) */
    meta: IRuleMetadata;
}

/** A rule to be executed */
export interface IRule {
    [key: string]: (...values: Array<any>) => void; // TODO: this should be of type Listener, find a way to find it
}

/** Options to run node-ssllabs */
export type SSLLabsOptions = {
    all: string;
    fromCache: boolean;
    host: string;
    maxAge: number;
};

export type SSLLabsEndpointDetail = {
    protocols: Array<any>;
};

export type SSLLabsEndpoint = {
    grade: string;
    serverName: string;
    details: { protocols: Array<string> };
};

export type SSLLabsResult = {
    endpoints: Array<SSLLabsEndpoint>;
};

/** Parsed Set Cookie Header. */
export type ParsedSetCookieHeader = {
    domain?: string;
    expires?: string;
    httponly?: boolean;
    'max-age'?: string;
    name: string;
    path?: string;
    resource?: string;
    samesite?: boolean;
    secure?: boolean;
    value: string;
};

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
    disclosureTime: string; // Should be a date time, but we don't hydrate that from JSON
    patches: Array<string>;
    publicationTime: string; // Should be a date time, but we don't hydrate that from JSON
    modificationTime: string; // Should be a date time, but we don't hydrate that from JSON
    creationTime: string; // Should be a date time, but we don't hydrate that from JSON
    id: string;
    packageName: string;
    cvssScore: number;
    alternativeIds: Array<string>;
};
