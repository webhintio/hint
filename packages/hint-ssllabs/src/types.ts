/**
 * Enum with the different possible grades for an endpoint returned by SSL Labs scan.
 *
 * https://github.com/ssllabs/ssllabs-scan/blob/stable/ssllabs-api-docs.md#endpoint
 */
export enum Grades {
    'A+' = 1,
    A,
    'A-',
    B,
    C,
    D,
    E,
    F,
    M,
    T
}

export type SSLLabsEndpoint = {
    grade: keyof typeof Grades;
    serverName: string;
    details: { protocols: Array<string> };
};

export type SSLLabsEndpointDetail = {
    protocols: Array<any>;
};

export type SSLLabsOptions = {
    all: string;
    fromCache: boolean;
    host: string;
    maxAge: number;
};

export type SSLLabsResult = {
    endpoints: Array<SSLLabsEndpoint>;
};
