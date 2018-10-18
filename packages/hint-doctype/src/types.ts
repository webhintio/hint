import { ProblemLocation } from 'hint/dist/src/lib/types';

export type MatchInformation = {
    matches: RegExpMatchArray | null;
    location: ProblemLocation;
};
