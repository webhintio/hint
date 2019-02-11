import html from '../../../../shared/html-literal';
import { Events } from '../../../../shared/types';

import { getMessage } from '../../utils/i18n';
import inspire from '../../utils/inspire';
import { addMessageListener, removeMessageListener } from '../../utils/messaging';

import headerView from '../partials/header';

import * as styles from './analyze.css';

import * as nellieWorkingSvg from '../../../../nellie-working.svg';

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
        <form class="${styles.analyze}" onsubmit=${onSubmit}>
            ${headerView({analyzeDisabled: true, analyzeText: getMessage('analyzeButtonLabel')})}
            <h1 class="${styles.header}">
                ${getMessage('analyzingStatus')}
            </h1>
            <section class="${styles.status}">
                <img class="${styles.image}" src="${nellieWorkingSvg}" />
                <p class="${styles.message}">${getMessage('analyzingStatus')}</p>
                <button class="${styles.cancelButton}" onclick=${onCancelClick}>
                    ${getMessage('cancelAnalysisButtonLabel')}
                </button>
            </section>
        </form>
    `;

    rotateMessages(fragment.querySelector(`.${styles.message}`)!, onMessageChange);

    return fragment;
}
