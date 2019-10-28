import * as React from 'react';
import { useCallback, MouseEvent } from 'react';

import { Problem as ProblemData } from '@hint/utils/dist/src/types/problems';

import { browser } from '../../../../shared/globals';

import InspectButton from '../../controls/inspect-button';
import SourceCode from '../../controls/source-code';

import * as styles from './problem.css';

type Props = {
    problem: ProblemData;
};

const Problem = ({ problem }: Props) => {
    const { line, column, elementId } = problem.location;
    const url = `${problem.resource}${line > -1 ? `:${line + 1}:${column + 1}` : ''}`;

    const onViewSourceClick = useCallback((event: MouseEvent) => {
        if (browser.devtools.panels.openResource) {
            event.preventDefault();
            browser.devtools.panels.openResource(problem.resource, line, () => {});
        }
    }, [line, problem.resource]);

    const codeArea = problem.sourceCode && (
        <SourceCode language={problem.codeLanguage}>
            {problem.sourceCode}
        </SourceCode>
    );

    return (
        <div>
            <a className={styles.problemLink} href={`view-source:${problem.resource}`} target="_blank" onClick={onViewSourceClick}>
                {url}
            </a>
            {elementId && <InspectButton target={elementId} /> }
            {codeArea}
        </div>
    );
};

export default Problem;
