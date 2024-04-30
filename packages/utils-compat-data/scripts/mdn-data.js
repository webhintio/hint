const fs = require('fs');
const mdn = require('@mdn/browser-compat-data');
const path = require('path');
const filename = path.resolve(`${__dirname}/../src/mdn-css-types.ts`);

/** @typedef {{ syntax: string }} Property */

/** @type {{[key: string]: Property}} */
const properties = require('mdn-data/css/properties.json');

/** Match a reference to a CSS property, e.g. `<'background-color'>` */
const propertyRef = /<'([a-z-]+)'>/gi;

/** Match a reference to a CSS type, e.g. `<color>` */
const typeRef = /<([a-z-]+)>/gi;

const problematicIds = new Set([
    'white-space-trim' // not present in mdn-data/css/properties.json
]);

/**
 * Helper for `[].flatMap` until we move to Node 11+.
 * @param {any[]} arr
 * @param {(item: any) => any} map
 */
const flatMap = (arr, map) => {
    return [].concat(...arr.map(map));
};

/**
 * Helper for `string.matchAll` until we move to Node 11+.
 * @param {string} str
 * @param {RegExp} regex
 */
const matchAll = (str, regex) => {
    let match;
    const matches = [];

    while ((match = regex.exec(str)) !== null) {
        matches.push(match);
    }

    return matches;
};

/**
 * Recursively resolve all CSS types which can be used in values for
 * the specified property. When a property references another property
 * the types from the referenced property will be included directly in
 * the flattened result array.
 * @param {string} name The name of the property to resolve types for.
 * @returns {string[]} A flattened array of all referenced types.
 */
const getTypesForProperty = (name) => {
    if (problematicIds.has(name)){
        return [name, ''];
    }

    const { syntax } = properties[name];
    const typeRefs = [...matchAll(syntax, typeRef)].map((m) => {
        return m[1];
    });
        /** @type {string[]} */
    const propertyRefs = flatMap([...matchAll(syntax, propertyRef)], (m) => {
        return getTypesForProperty(m[1]);
    });

    return typeRefs.concat(propertyRefs);
};

// Resolve unique referenced types for all properties in the dataset.
const props = Object.keys(properties);
const types = props.map((key) => {
    return [
        key,
        [...new Set(getTypesForProperty(key))].filter((type) => {
            // Exclude types not present in @mdn/browser-compat-data since we won't need them.
            return mdn.css.types[type];
        })
    ];
}).filter((entry) => {
    return entry[1].length;
});

/*
 * Export in a map of property names to array of referenced CSS types.
 * E.g.
 * ```json
 * {
 *      "border-bottom-color": {
 *          "syntax": "<'border-top-color'>"
 *      },
 *      "border-top-color": {
 *          "syntax": "<color>"
 *      }
 * }
 * ```
 *
 * becomes
 *
 * ```js
 * new Map([
 *      ['border-bottom-color', ['color']],
 *      ['border-top-color', ['color']]
 * ])
 * ```
 */
const code = `/* eslint-disable */
export const types = new Map([${types.map((type) => {
        return `\n    ${JSON.stringify(type)}`;
    })}
]);
`;

fs.writeFile(filename, code, (err) => {
    if (err) {
        throw err;
    } else {
        console.log(`Created: ${filename}`);
    }
});
