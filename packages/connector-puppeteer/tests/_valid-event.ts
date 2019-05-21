import every = require('lodash/every');

/**
 * Losely compares two data events. It will check if all the properties in
 * `data2` are in `data1` with the same values.
 */
const sameData = (actual: any, expected: any): boolean => {
    const actualType = typeof actual;
    const expectedType = typeof expected;

    // If `expected` doesn't have a value, then it is an enhacement and we can ignore it
    if (actualType !== 'undefined' && expectedType === 'undefined') {
        return true;
    }

    // We test here getAttribute.
    if (expectedType === 'function' && actualType === 'function') {
        return ['src', 'href'].some((attribute) => {
            return actual(attribute) === expected(attribute);
        });
    }

    if (expectedType !== 'object' || actual === null) {
        return actual === expected;
    }

    return every(expected, (value, key) => {
        return sameData(actual[key], value);
    });
};

export const validEvent = (eventsToSearch: any[], expectedEvent: any) => {
    const originalSize = eventsToSearch.length;

    for (let i = 0; i < eventsToSearch.length; i++) {
        const emittedEvent = eventsToSearch[i];

        if (sameData(emittedEvent, expectedEvent)) {
            eventsToSearch.splice(i, 1);

            break;
        }
    }

    return originalSize !== eventsToSearch.length;
};
