import html from '../../../../shared/html-literal';

import headerView from '../partials/header';

import '../partials/page.css';
import './analyze.css';

type Props = {
    onCancelClick: Function;
};

// eslint-disable-next-line
export default function view({ onCancelClick }: Props) {
    return html`
        ${headerView({analyzeDisabled: true, analyzeText: 'Analyze website'})}
        <section class="analyze page">
            <h1 class="page__header">
                Analyzing...
            </h1>
            <section class="analyze__status">
                <button class="page__button analyze__cancel-button" onclick=${onCancelClick}>
                    Cancel analysis
                </button>
            </section>
        </section>
    `;
}
