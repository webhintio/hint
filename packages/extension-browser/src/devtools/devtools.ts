import { browser } from '../shared/globals';
import { getMessage } from './utils/i18n';

browser.devtools.panels.create(
    getMessage('hintsTitle'),
    '/icon.png',
    '/devtools/panel.html'
);
