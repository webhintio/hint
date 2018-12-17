/**
 * @fileoverview description
 */

import * as CCSDeprecatedHint from './css';
import * as CCSNextHint from './css-next';
import * as HTMLDeprecatedHint from './html';
import * as HTMLNextHint from './html-next';

/* eslint-disable quote-props */

module.exports = {
    'css': CCSDeprecatedHint,
    'css-next': CCSNextHint,
    'html': HTMLDeprecatedHint,
    'html-next': HTMLNextHint
};
