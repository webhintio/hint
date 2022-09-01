import { ProblemLocation } from './problem-location';

export type CodeFix = {
    location: ProblemLocation;
    text: string;
}
