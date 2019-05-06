const enum ValidStatements {
    and = 'and',
    empty = '',
    false = 'false',
    negation = 'not',
    or = 'or',
    selector = 'selector',
    true = 'true'
}

const validStatementsStrings: string[] = Object.values(ValidStatements);

// nottrue
validStatementsStrings.push(`${ValidStatements.negation}${ValidStatements.true}`);
// notfalse
validStatementsStrings.push(`${ValidStatements.negation}${ValidStatements.false}`);
// selectortrue
validStatementsStrings.push(`${ValidStatements.selector}${ValidStatements.true}`);
// selectorfalse
validStatementsStrings.push(`${ValidStatements.selector}${ValidStatements.false}`);

export const evaluateQuery = (queryString: string): boolean => {
    const query = queryString.toLowerCase();

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
    const splitQuery = finalQuery.trim().split(' ');
    let operator: string | null = null;
    let result: boolean | null = null;

    for (const partialQuery of splitQuery) {
        /*
         * We expect only the strings in validStatementsStrings.
         * If we receive something diferente, validate the whole
         * query as true.
         * e.g. var, x, =, console, etc.
         */
        if (!partialQuery.startsWith(ValidStatements.negation) && !partialQuery.startsWith(ValidStatements.selector) && !validStatementsStrings.includes(partialQuery)) {
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

        if (partialQuery.startsWith(ValidStatements.negation)) {
            partialResult = !evaluateQuery(partialQuery.substr(ValidStatements.negation.length));
        } else if (partialQuery.startsWith(ValidStatements.selector)) {
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
             * Calculate the accumulated result.
             */
            result = operator === ValidStatements.and ? result && partialResult : result || partialResult;

            operator = null;
        }
    }

    return !!result;
};
