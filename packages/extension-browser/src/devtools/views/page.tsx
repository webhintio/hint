import * as React from 'react';
import { useCallback, FormEvent } from 'react';

import PageHeader from './page-header';

import * as styles from './page.css';

type Props = {
    actionDisabled?: boolean;
    actionName: string;
    children: any;
    className?: string;
    title: string;
    onAction?: () => void;
};

/** Display a top-level page for the extension. */
const Page = ({ actionDisabled, actionName, children, className, title, onAction }: Props) => {

    const onSubmit = useCallback((event: FormEvent) => {
        event.preventDefault();

        if (onAction) {
            onAction();
        }
    }, [onAction]);

    return (
        <form className={`${styles.root} ${className || ''}`} onSubmit={onSubmit}>
            <PageHeader actionDisabled={actionDisabled} actionName={actionName} />
            <h1 className={styles.header}>
                {title}
            </h1>
            {children}
        </form>
    );
};

export default Page;
