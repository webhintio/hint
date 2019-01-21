import html from '../../../../shared/html-literal';
import { Events } from '../../../../shared/types';

import inspire from '../../utils/inspire';
import { addMessageListener, removeMessageListener } from '../../utils/messaging';

import headerView from '../partials/header';

import '../partials/page.css';
import './analyze.css';

type Props = {
    onCancelClick: Function;
    onMessageChange: Function;
};

const onSubmit = (event: Event) => {
    event.preventDefault();
};

/** Switch between messages periodically while we wait for a scan to finish. */
const rotateMessages = (element: Element, onMessageChange: Function) => {
    const interval = setInterval(() => {
        element.textContent = inspire();
        onMessageChange();
    }, 7500);

    const stopRotating = (message: Events) => {
        removeMessageListener(stopRotating);
        if (message.results) {
            clearInterval(interval);
        }
    };

    onMessageChange();
    addMessageListener(stopRotating);
};

export default function view({ onCancelClick, onMessageChange }: Props) {
    const fragment = html`
        <form class="analyze page" onsubmit=${onSubmit}>
            ${headerView({analyzeDisabled: true, analyzeText: 'Analyze website'})}
            <h1 class="page__header">
                Analyzing...
            </h1>
            <section class="analyze__status">
                <img class="analyze__image" src="/nellie-working.svg" />
                <p class="analyze__message">Analyzing...</p>
                <button class="page__button page__button--primary analyze__cancel-button" onclick=${onCancelClick}>
                    Cancel analysis
                </button>
            </section>
        </form>
    `;

    rotateMessages(fragment.querySelector('.analyze__message')!, onMessageChange);

    return fragment;
}
