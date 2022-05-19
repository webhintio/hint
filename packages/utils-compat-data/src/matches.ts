import { CompatStatement } from '@mdn/browser-compat-data/types';

export interface IMatchesCompatStatement extends CompatStatement {
    matches?: IMatchesBlock;
}

export interface IMatchesBlock {
    keywords?: string[];
    regex_token?: string; // eslint-disable-line camelcase
    regex_value?: string; // eslint-disable-line camelcase
}
