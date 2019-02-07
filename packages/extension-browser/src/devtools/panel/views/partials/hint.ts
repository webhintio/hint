import html from '../../../../shared/html-literal';
import { HintResults } from '../../../../shared/types';

import { getMessage } from '../../utils/i18n';

import problemView from './problem';

import * as styles from './hint.css';

export default function view({ name, problems, helpURL }: HintResults) {
    return html`
        <details class="${styles.hint}">
            <summary class="${styles.summary}">
                <span>
                    ${name}:
                </span>
                <span class="${styles.status} ${!problems.length ? styles.passed : ''}">
                    ${!problems.length ? getMessage('passedStatus') : problems.length.toString()}
                </span>
            </summary>
            <div class="${styles.results}">
                <a href="${helpURL}" target="_blank">
                    ${problems.length ? getMessage('learnWhyLabel') : getMessage('learnWhyAndHowLabel')}
                </a>
                ${problems.map(problemView)}
            </div>
        </details>
    `;
}
