const basePrefix = '__html';
const pathAttr = 'data-path';

/** Resolve a value at the specified path from the provided collection of values. */
const getValue = (path: string | string[], values: any[]): any => {
    let v = values;

    // Break a dashed string into a list of indices if needed (dropping `basePrefix`).
    const indicies = typeof path === 'string' ? path.split('-').slice(1) : path;

    // Recursively resolve the value using provided indicies.
    while (indicies.length) {
        v = v[parseInt(indicies.shift()!)];
    }

    return v;
};

/** Make the specified value safe for including in generated HTML. */
const safe = (value: any, index: number, prefix = basePrefix): string => {
    const path = `${prefix}-${index}`;

    // Use the empty string for `null | undefined` to omit from resulting string.
    if (value === null || value === undefined) {
        return '';
    }

    // Use a placeholder string for `function`s (converted to event listeners after parsing).
    if (typeof value === 'function') {
        return path; // e.g. `__html-0` or `__html-0-1`
    }

    // Use a placeholder element for `Node`s (inlined after parsing).
    if (value instanceof Node) {
        return `<span class='${basePrefix}' ${pathAttr}='${path}'></span>`;
    }

    // Flatten `Array`s, recursively making values safe.
    if (Array.isArray(value)) {
        return value.map((v, i) => safe(v, i, path)).join(''); // eslint-disable-line
    }

    // Make `string`s safe by escaping values which can close or create markup.
    return `${value}`
        .replace(`&`, '&amp;')
        .replace(`<`, '&lt;')
        .replace(`>`, '&gt;')
        .replace(`"`, '&quot;')
        .replace(`'`, '&apos;');
};

/**
 * Minimal tag function for converting template literals to HTML `DocumentFragment`s.
 * Usage: ``const fragment = html`<div onclick=${fn}>${content}</div>`;``
 * * Escapes values to be safe in HTML.
 * * Inlines `Node`s (for nesting).
 * * Recursively processes `Array`s (for generating lists).
 * * Registers functions as event listeners.
 */
export default function html(strings: TemplateStringsArray, ...values: any[]): DocumentFragment {
    // Use a `<template>` element to get the correct parsing context, even for `<tr>`s.
    const t = document.createElement('template');

    // Make provided values safe, combine with template strings, and parse as HTML.
    t.innerHTML = strings.reduce((combined, str, i) => {
        return `${combined}${str}${safe(values[i], i)}`;
    }, '');

    // Replace temporary placeholders with original objects.
    t.content.querySelectorAll('*').forEach((elm) => {
        if (elm.classList.contains(basePrefix)) {

            // Replace placeholder elements with original DOM `Node`s.
            elm.parentNode!.replaceChild(getValue(elm.getAttribute(pathAttr)!, values), elm);

        } else {

            // Replace placeholder event attributes with original `function` listeners.
            Array.from(elm.attributes).forEach(({ name, value }) => {
                if (name.startsWith('on') && value.startsWith(basePrefix)) {
                    elm.removeAttribute(name);
                    (elm as any)[name] = getValue(value, values);
                }
            });
        }
    });

    return t.content;
}
