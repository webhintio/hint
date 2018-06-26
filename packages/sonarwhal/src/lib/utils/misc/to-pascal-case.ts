/** Convert '-' delimitered string to pascal case name. */
export default (value: string) => {
    return value.split('-').reduce((accu: string, w: string) => {
        let current = accu;

        current += w.length ? `${w.charAt(0).toUpperCase()}${w.substr(1).toLowerCase()}` : '';

        return current;
    }, '');
};
