import { browser } from '../shared/globals';
import { getMessage } from './panel/utils/i18n';

browser.devtools.panels.create(
    getMessage('hintsTitle'),
    '/icon.png',
    '/devtools/panel/panel.html'
);
