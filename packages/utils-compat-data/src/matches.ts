import { CompatStatement } from '@mdn/browser-compat-data/types';

export interface MatchesCompatStatement extends CompatStatement {
    matches?: MatchesBlock;
}

export interface MatchesBlock {
    keywords?: string[];
    regex_token?: string;
    regex_value?: string;
}
