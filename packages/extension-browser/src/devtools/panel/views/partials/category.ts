import html from '../../../../shared/html-literal';
import { CategoryResults } from '../../../../shared/types';

import hintView from './hint';

import './category.css';

export default function view({ name, hints, passed }: CategoryResults) {
    return html`
        <details class="category">
            <summary class="category__summary">
                <span class="category__name">
                    ${name}
                </span>
                <span class="category__status">
                    PASSED: ${passed}/${hints.length}
                </span>
            </summary>
            <div class="category__results">
                ${hints.map(hintView)}
            </div>
        </details>
    `;
}
