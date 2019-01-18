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

export default function view({ onRestartClick, results }: Props) {
    const onSubmit = (event: Event) => {
        event.preventDefault();
        onRestartClick();
    };

    return html`
        <form class="results page" onsubmit=${onSubmit}>
            ${headerView({ analyzeText: 'Analyze again' })}
            <h1 class="page__header">Hints</h1>
            ${results.categories.map(categoryView)}
        </form>
    `;
}
