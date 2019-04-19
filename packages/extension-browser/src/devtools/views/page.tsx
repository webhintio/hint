import * as React from 'react';
import { useCallback, FormEvent } from 'react';

import * as styles from './page.css';

type Props = {
    children: any;
    className?: string;
    disabled?: boolean;
    onAction?: () => void;
};

/** Display a top-level page for the extension. */
const Page = ({ children, className, disabled, onAction }: Props) => {

    const onSubmit = useCallback((event: FormEvent) => {
        event.preventDefault();

        if (onAction) {
            onAction();
        }
    }, [onAction]);

    return (
        <form className={`${styles.root} ${className || ''} ${disabled ? styles.disabled : ''}`} onSubmit={onSubmit}>
            <fieldset className={styles.fieldset} disabled={disabled}>
                {children}
            </fieldset>
        </form>
    );
};

export default Page;
