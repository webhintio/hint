import { ProblemLocation } from 'hint';

export type MatchInformation = {
    matches: RegExpMatchArray | null;
    locations: ProblemLocation[];
};
