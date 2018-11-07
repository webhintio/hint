import html from '../../../../shared/html-literal';
import { Results } from '../../../../shared/types';

import headerView from '../partials/header';
import categoryView from '../partials/category';

import '../partials/page.css';
import './results.css';

type Props = {
    onRestartClick: Function;
    results: Results;
};

// eslint-disable-next-line
export default function view({ onRestartClick, results }: Props) {
    return html`
        ${headerView({ analyzeText: 'Analyze again', onAnalyzeClick: onRestartClick })}
        <section class="results page">
            <h1 class="page__header">Hints</h1>
            ${results.categories.map(categoryView)}
        </section>
    `;
}
