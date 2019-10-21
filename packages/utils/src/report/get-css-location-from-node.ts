import { ChildNode } from 'postcss';
import { ProblemLocation } from '../types/problems';

export const getLocationFromNode = (node: ChildNode): ProblemLocation | undefined => {
    const start = node.source && node.source.start;
    const end = node.source && node.source.end;

    const location: ProblemLocation | {} = {
        ...start && {
            column: start.column - 1,
            line: start.line - 1
        },
        ...end && {
            endColumn: end.column - 1,
            endLine: end.line - 1
        }
    };

    return (start || end) ? location as ProblemLocation : undefined;
};
