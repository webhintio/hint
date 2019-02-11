import html from '../../../../shared/html-literal';
import { CategoryResults } from '../../../../shared/types';

import { getMessage } from '../../utils/i18n';

import hintView from './hint';

import * as styles from './category.css';

export default function view({ name, hints, passed }: CategoryResults) {
    return html`
        <details class="${styles.category}" open>
            <summary class="${styles.summary}">
                <span class="${styles.name}">
                    ${getMessage(name)}
                </span>
                <span class="${styles.status}">
                    ${getMessage('passedLabel', [passed.toString(), hints.length.toString()])}
                </span>
            </summary>
            <div class="${styles.results}">
                ${hints.map(hintView)}
            </div>
        </details>
    `;
}
