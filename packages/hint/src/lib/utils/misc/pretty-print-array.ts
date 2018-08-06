/*
 * Returns an array pretty printed.
 *
 * e.g.:
 *
 *  []              =>
 *  [1]             => '1'
 *  [1, 2]          => '1' and '2'
 *  [1, '2', 3]     => '1', '2', and '3'
 *
 */

export default (array: Array<string|number>): string => {
    const items = Array.from(array);

    if (!items || items.length === 0) {
        return '';
    }

    const firstElement = items.shift();

    if (items.length === 0) {
        return `'${firstElement}'`;
    }

    if (items.length === 1) {
        return `'${firstElement}' and '${items.pop()}'`;
    }

    const lastElement = items.pop();

    return `'${firstElement}', '${items.join('\', \'')}', and '${lastElement}'`;
};
