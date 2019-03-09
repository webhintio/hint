enum ValidStatements {
    and = '&&',
    empty = '',
    false = 'false',
    negation = '!',
    or = '||',
    selector = '#',
    true = 'true'
}

const validStatementsStrings: string[] = [];

for (const [, value] of Object.entries(ValidStatements)) {
    if (value !== 'other') {
        validStatementsStrings.push(value);
    }
}

// !true
validStatementsStrings.push(`${ValidStatements.negation}${ValidStatements.true}`);
// !false
validStatementsStrings.push(`${ValidStatements.negation}${ValidStatements.false}`);
// #true
validStatementsStrings.push(`${ValidStatements.selector}${ValidStatements.true}`);
// #false
validStatementsStrings.push(`${ValidStatements.selector}${ValidStatements.false}`);

export const evaluateQuery = (query: string): boolean => {
    if (query === 'false') {
        return false;
    } else if (query === 'true') {
        return true;
    }

    const regex = /\(([^()]*)\)/;
    /*
     * Get content inside parentheses.
     */
    let exec = regex.exec(query);
    let finalQuery = query;

    while (exec !== null) {
        const condition = exec[1];

        finalQuery = finalQuery.replace(exec[0], evaluateQuery(condition).toString());

        exec = regex.exec(finalQuery);
    }

    /*
     * Split the query in statements.
     */
    const splitedQuery = finalQuery.trim().split(' ');
    let operator: string | null = null;
    let result: boolean | null = null;

    for (const partialQuery of splitedQuery) {
        const firstCharacter = partialQuery[0];

        /*
         * We expect only the strings in validStatementsStrings.
         * If we receive something diferente, validate the whole
         * query as true.
         * e.g. var, x, =, console, etc.
         */
        if (firstCharacter !== ValidStatements.negation && firstCharacter !== ValidStatements.selector && !validStatementsStrings.includes(partialQuery)) {
            return true;
        }

        /*
         * If partialQuery is an empty string, ignore it.
         */
        if (!partialQuery) {
            continue;
        }

        /*
         * Store the operator statement for the next item.
         */
        if (partialQuery === ValidStatements.and || partialQuery === ValidStatements.or) {
            operator = partialQuery;

            continue;
        }

        /*
         * Check if the statement is negated, is a selector, or neither of those.
         */
        let partialResult: boolean;

        if (firstCharacter === ValidStatements.negation) {
            partialResult = !evaluateQuery(partialQuery.substr(1));
        } else if (firstCharacter === ValidStatements.selector) {
            partialResult = true;
        } else {
            partialResult = evaluateQuery(partialQuery);
        }

        /*
         * This should be true only in the first iteration.
         */
        if (result === null) {
            result = partialResult;

            continue;
        }

        if (operator) {
            /*
             * Calculate the acumulated result.
             */
            result = operator === '&&' ? result && partialResult : result || partialResult;

            operator = null;
        }
    }

    return result!;
};
