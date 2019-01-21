const prefix = 'base64:';

/** Serializes a `Buffer` using `base64`. */
const replacer = (key: string, value: any) => {

    /**
     * When doing a `JSON.parse(Buffer)` the output is
     * ```
     * {
     *   "type": "Buffer",
     *   "data": Array
     * }
     * ```
     *
     * To serialize we transform the `data` property into
     * a `base64` string.
     */

    if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
        const base64Buffer = Buffer.from(value.data).toString('base64');

        value.data = `${prefix}${base64Buffer}`;
    }

    return value;
};

/** Revives a string of a `Buffer` that was `base64` seralized. */
const reviver = (key: string, value: any) => {
    if (value && value.type === 'Buffer' && value.data.startsWith(prefix)) {

        /**
         * We do not need the `type` or `data` properties so the `Buffer`
         * is returned directly.
         */
        return Buffer.from(value.data.replace(prefix, ''), 'base64');
    }

    return value;
};

export {
    replacer,
    reviver
};
