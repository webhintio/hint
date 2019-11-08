import { ProblemLocation } from '@hint/utils-types';

export type MatchInformation = {
    matches: RegExpMatchArray | null;
    locations: ProblemLocation[];
};
