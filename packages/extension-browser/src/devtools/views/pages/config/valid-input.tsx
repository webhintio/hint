import * as React from 'react';
import { useCallback, DetailedHTMLProps, InputHTMLAttributes } from 'react';

type Props = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    validate: (value: string) => string;
    value: string;
};

/**
 * Create an `<input>` with a custom `validate` function.
 */
const ValidInput = ({ onChange, validate, value, ...props }: Props) => {

    /*
     * Update custom validity whenever value changes.
     * Based on https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
     */
    const inputRef = useCallback((input: HTMLInputElement | null) => {
        if (input) {
            input.setCustomValidity(validate(value));
        }
    }, [validate, value]);

    return (
        <input ref={inputRef} onChange={onChange} value={value} {...props} />
    );
};

export default ValidInput;
