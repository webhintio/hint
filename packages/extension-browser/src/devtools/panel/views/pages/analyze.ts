import html from '../../../../shared/html-literal';

import headerView from '../partials/header';

import '../partials/page.css';
import './analyze.css';

type Props = {
    onCancelClick: Function;
};

const onSubmit = (event: Event) => {
    event.preventDefault();
};

export default function view({ onCancelClick }: Props) {
    return html`
        <form class="analyze page" onsubmit=${onSubmit}>
            ${headerView({analyzeDisabled: true, analyzeText: 'Analyze website'})}
            <h1 class="page__header">
                Analyzing...
            </h1>
            <section class="analyze__status">
                <button class="page__button page__button--primary analyze__cancel-button" onclick=${onCancelClick}>
                    Cancel analysis
                </button>
            </section>
        </form>
    `;
}
