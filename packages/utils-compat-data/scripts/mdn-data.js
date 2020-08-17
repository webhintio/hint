const fs = require('fs');
const path = require('path');
const filename = path.resolve(`${__dirname}/../src/mdn-css-types.ts`);

/** @typedef {{ syntax: string }} Property */

/** @type {{[key: string]: Property}} */
const properties = require('mdn-data/css/properties.json');

const propertyRef = /<'([a-z-]+)'>/gi;
const typeRef = /<([a-z-]+)>/gi;

/**
 * @param {any[]} arr
 * @param {(item: any) => any} map
 */
const flatMap = (arr, map) => {
    return [].concat(...arr.map(map));
};

/**
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
 * @param {string} name
 * @returns {string[]}
 */
const getTypesForProperty = (name) => {
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

const props = Object.keys(properties);
const types = props.map((key) => {
    return [
        key,
        [...new Set(getTypesForProperty(key))]
    ];
}).filter((entry) => {
    return entry[1].length;
});

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
