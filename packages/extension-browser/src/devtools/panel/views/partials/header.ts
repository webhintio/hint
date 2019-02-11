import html from '../../../../shared/html-literal';

import { getMessage } from '../../utils/i18n';

import * as styles from './header.css';

type Props = {
    analyzeDisabled?: boolean;
    analyzeText: string;
};

export default function view({ analyzeDisabled, analyzeText }: Props) {
    return html`
        <header class="${styles.header}">
            <div class="${styles.actions}">
                <button type="submit" class="${styles.analyzeButton}" ${analyzeDisabled ? 'disabled' : ''}>
                    ${analyzeText}
                </button>
            </div>
            <div class="${styles.help}">
                ${getMessage('checkForBestPracticesDescription')}
                <span class="${styles.poweredBy}">
                    ${getMessage('poweredByLabel')}
                    <a href="https://webhint.io" target="_blank">webhint</a>
                </span>
            </div>
        </header>
    `;
}
