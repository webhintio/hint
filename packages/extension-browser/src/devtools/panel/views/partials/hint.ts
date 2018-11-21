import html from '../../../../shared/html-literal';
import { HintResults } from '../../../../shared/types';

import problemView from './problem';

import './hint.css';

export default function view({ name, problems, helpURL }: HintResults) {

    const hintStatus = !problems.length ?
        'PASSED' :
        `${problems.length} hint${problems.length !== 1 ? 's' : ''}`;

    return html`
        <details class="hint">
            <summary class="hint__summary">
                <span class="hint__name">
                    ${name}:
                </span>
                <span class="hint__status ${!problems.length ? 'hint__status--passed' : ''}">
                    ${hintStatus}
                </span>
            </summary>
            <div class="hint__results">
                <a href="${helpURL}" target="_blank">
                    Learn why this is important${problems.length ? ' and how to fix it' : ''}
                </a>
                ${problems.map(problemView)}
            </div>
        </details>
    `;
}
