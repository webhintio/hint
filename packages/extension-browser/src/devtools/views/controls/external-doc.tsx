import * as React from 'react';

import { ProblemDocumentation } from '@hint/utils-types';

import { getMessage } from '../../utils/i18n';
import ExternalLink from './external-link';

import * as styles from './external-doc.css';

type Props = {
    docs: ProblemDocumentation[];
};

const ExternalDocs = ({ docs }: Props) => {
    return (
        <div>
            <h4 className={styles.header}>{getMessage('furtherReading')}</h4>
            <ul className={styles.list}>
                {docs.map((doc, i) => {
                    return <li><ExternalLink href={doc.link} key={i}>{doc.text}</ExternalLink></li>;
                })}
            </ul>
        </div>
    );
};

export default ExternalDocs;
