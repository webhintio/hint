import html from '../../../../shared/html-literal';
import { HintResults } from '../../../../shared/types';

import problemView from './problem';

import * as styles from './hint.css';

export default function view({ name, problems, helpURL }: HintResults) {

    const hintStatus = !problems.length ?
        'PASSED' :
        `${problems.length} hint${problems.length !== 1 ? 's' : ''}`;

    return html`
        <details class="${styles.hint}">
            <summary class="${styles.summary}">
                <span>
                    ${name}:
                </span>
                <span class="${styles.status} ${!problems.length ? styles.passed : ''}">
                    ${hintStatus}
                </span>
            </summary>
            <div class="${styles.results}">
                <a href="${helpURL}" target="_blank">
                    Learn why this is important${problems.length ? ' and how to fix it' : ''}
                </a>
                ${problems.map(problemView)}
            </div>
        </details>
    `;
}
