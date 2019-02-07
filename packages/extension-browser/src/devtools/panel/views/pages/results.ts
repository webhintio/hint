import html from '../../../../shared/html-literal';
import { Results } from '../../../../shared/types';

import { getMessage } from '../../utils/i18n';

import headerView from '../partials/header';
import categoryView from '../partials/category';

import * as styles from '../partials/page.css';

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
        <form class="${styles.page}" onsubmit=${onSubmit}>
            ${headerView({ analyzeText: getMessage('analyzeAgainButtonLabel') })}
            <h1 class="${styles.header}">${getMessage('hintsTitle')}</h1>
            ${results.categories.map(categoryView)}
        </form>
    `;
}
