import * as React from 'react';

import { ProblemDocumentation } from '@hint/utils-types';

import { getMessage } from '../../utils/i18n';
import ExternalLink from './external-link';

import * as styles from './external-doc.css';

type Props = {
    doc: ProblemDocumentation[];
};

const ExternalDoc = ({ doc }: Props) => {
    return (
        <div>
            <h4 className={styles.header}>{getMessage('furtherReading')}</h4>
            <ul className={styles.list}>
                {doc.map((d, i) => {
                    return <li><ExternalLink href={d.link} key={i}>{d.text}</ExternalLink></li>;
                })}
            </ul>
        </div>
    );
};

export default ExternalDoc;
