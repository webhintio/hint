import { ChildNode, Declaration } from 'postcss';
import { ProblemLocation } from '../types/problems';

type Position = {
    column: number;
    line: number;
}

export type CSSLocationOptions = {
    isValue?: boolean;
}

/**
 * Set the start and end position for a property value.
 */
const setValuePosition = (node: Declaration, start: Position, end: Position) => {
    const betweenSplit = node.raws.between ? node.raws.between.split('\n') : [''];

    end.line = start.line + betweenSplit.length - 1;
    end.column = betweenSplit.length === 1 ?
        // The value is in the same line as the property.
        start.column + node.prop.length + betweenSplit[0].length + node.value.length :
        /*
         * The value is in a different line we need to add one
         * because the position we are looking for is charecter after the end of the value
         * e.g.
         *     value;
         *          ^
         */
        betweenSplit[betweenSplit.length - 1].length + node.value.length + 1;

    start.line = end.line;
    start.column = end.column - node.value.length;
};

/**
 * Returns the location of a CSS node.
 * @param node postcss Node.
 * @param isValue Indicates if we need the location of the property value.
 */
export const getCSSLocationFromNode = (node: ChildNode, options: CSSLocationOptions = {}): ProblemLocation | undefined => {
    if (!node.source || !node.source.start) {
        return undefined;
    }

    // Clone `source.start` to not modify the original value.
    const start = { ...node.source.start };
    const end = {
        column: start.column,
        line: start.line
    };

    if (node.type === 'decl') {
        if (options.isValue) {
            setValuePosition(node, start, end);
        } else {
            end.line = start.line;
            end.column = start.column + node.prop.length;
        }
    }

    return {
        column: start.column - 1,
        endColumn: end.column - 1,
        endLine: end.line - 1,
        line: start.line - 1
    };
};
