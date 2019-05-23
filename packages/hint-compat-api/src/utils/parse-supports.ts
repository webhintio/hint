export type Declaration = {
    prop: string;
    value: string;
};

export type DeclarationGroup = {
    type: 'and' | 'or' | 'not';
    nodes: (Declaration | DeclarationGroup)[];
};

type Token = '(' | ')' | 'not' | 'and' | 'or' | Declaration;

/**
 * Represents errors encountered while parsing bad input.
 * These will be caught and used to return `null`.
 *
 * The type is unique to this file to avoid accidentally exposing
 * these errors to or catching unrelated errors from some other part
 * of the code.
 */
class InvalidInputError extends Error {
    public constructor(message: string) {
        super(message);
    }
}

const isDeclaration = (token: Token): token is Declaration => {
    return typeof token !== 'string';
};

/**
 * Called after parsing the start of a declaration `(property:` to
 * parse the value of the declaration which may contain arbitrary
 * nested parens (e.g. `(transform: translateZ(var(--depth)))`).
 *
 * Completes when finding the closing paren `)` after
 * the end of the declaration value.
 *
 * @returns A tuple containing the position of the closing paren `)`
 * and a `Declaration` token with the declaration name and value.
 */
const tokenizeDeclarationValue = (data: string, prop: string, start: number): [number, Declaration] => {
    let depth = 0;
    let temp = '';

    for (let i = start; i < data.length; i++) {
        const char = data[i];

        if (char === '(') {
            depth++;
        } else if (char === ')') {
            depth--;
        }

        // TODO: Add a state for handling strings to ignore parens inside of a string.

        if (depth >= 0) {
            temp += char;
        } else {
            return [i, { prop, value: temp.trim() }];
        }
    }

    throw new InvalidInputError('Invalid declaration value');
};

/**
 * Convert an `@supports` params string into a list of `Token`s.
 *
 * ```css
 * @supports not ((display: flex) or (display: grid))
 * ```
 *
 * ```js
 * ['not', '(', { prop: 'display', value: 'flex' }, 'or', { prop: 'display', value: 'grid' }, ')']
 * ```
 */
const tokenizeParams = (params: string): Token[] => {
    const tokens: Token[] = [];

    for (let i = 0, temp = ''; i < params.length; i++) {
        const char = params[i].trim();
        let token: Declaration;

        switch (char) {
            case '':
                // Ignore whitespace between tokens.
                continue;
            case '(':
            case ')':
                // Parens close the in-progress temp token (if any).
                if (temp) {
                    // Temp token must be a known operator to be valid.
                    if (temp !== 'and' && temp !== 'or' && temp !== 'not') {
                        throw new InvalidInputError('Invalid @supports format');
                    }
                    tokens.push(temp);
                    temp = '';
                }
                tokens.push(char);
                continue;
            case ':':
                /*
                 * A colon switches to the declaration value parsing state.
                 * The in-progress temp token is the declaration name.
                 * Pass `i + 1` to skip over the colon when parsing the value.
                 */
                [i, token] = tokenizeDeclarationValue(params, temp, i + 1);
                i -= 1; // -1 to process ending ')' token on next iteration.
                temp = '';
                tokens.push(token);
                break;
            default:
                // Otherwise consider part of an in-progress temp token.
                temp += char;
        }
    }

    // Remove redundant `(` and `)` tokens around `Declaration`s before returning.
    return tokens.filter((token, i) => {
        return !(
            (token === '(' && isDeclaration(tokens[i + 1])) ||
            (token === ')' && isDeclaration(tokens[i - 1]))
        );
    });
};

const parseParams = (params: string): DeclarationGroup => {
    const tokens = tokenizeParams(params);

    const groups: DeclarationGroup[] = [{
        nodes: [],
        type: 'and'
    }];

    for (const token of tokens) {
        switch (token) {
            case '(':
                // Left paren creates a new current group.
                groups.unshift({
                    nodes: [],
                    type: 'and'
                });
                // New group is also a node in the previous group.
                groups[1].nodes.push(groups[0]);
                break;
            case ')':
                // Right paren closes current group.
                groups.shift();
                break;
            case 'and':
            case 'or':
            case 'not':
                // Operator changes current group type.
                groups[0].type = token;
                break;
            default:
                // Declarations are nodes in the current group.
                groups[0].nodes.push(token);
        }
    }

    if (groups.length !== 1) {
        throw new InvalidInputError('Mis-matched parenthesis');
    }

    return groups[0];
};

/**
 * Parse an `@supports` params string into an AST.
 *
 * ```css
 * @supports not ((display: flex) or (display: grid))
 * ```
 *
 * ```js
 * {
 *     type: 'not',
 *     nodes: [
 *         {
 *             type: 'or',
 *             nodes: [
 *                 { prop: 'display', value: 'flex' },
 *                 { prop: 'display', value: 'grid' }
 *             ]
 *         }
 *     ]
 * }
 * ```
 */
export const parseSupports = (params: string): DeclarationGroup | null => {
    try {
        return parseParams(params);
    } catch (e) {
        // Gracefully exit parsing for expected errors from invalid input.
        if (e instanceof InvalidInputError) {
            return null;
        }

        // But let unexpected errors bubble up.
        throw e;
    }
};
