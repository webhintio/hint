import html from '../../../../shared/html-literal';
import { CategoryResults } from '../../../../shared/types';

import hintView from './hint';

import * as styles from './category.css';

export default function view({ name, hints, passed }: CategoryResults) {
    return html`
        <details class="${styles.category}" open>
            <summary class="${styles.summary}">
                <span class="${styles.name}">
                    ${name}
                </span>
                <span class="${styles.status}">
                    PASSED: ${passed}/${hints.length}
                </span>
            </summary>
            <div class="${styles.results}">
                ${hints.map(hintView)}
            </div>
        </details>
    `;
}
