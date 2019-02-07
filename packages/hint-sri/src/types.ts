import { ReportOptions } from 'hint/dist/src/lib/hint-context';

// We don't do a `const enum` because of this: https://stackoverflow.com/questions/18111657/how-does-one-get-the-names-of-typescript-enum-entries#comment52596297_18112157
export enum Algorithms {
    sha256 = 1,
    sha384 = 2,
    sha512 = 3
}

export enum OriginCriteria {
    all = 1,
    crossOrigin = 2
}

export type ErrorData = {
    options: ReportOptions;
    message: string;
    resource: string;
};

export type CacheComponents = {
    key: string;
    errors: ErrorData[];
};

export type URLs = {
    origin: string;
    final: string;
};
