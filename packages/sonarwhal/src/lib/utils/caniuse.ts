/*
 * This file is necessary in order to avoid version problems runing browserlists.
 */
import * as caniuse from 'caniuse-api';

export const isSupported = caniuse.isSupported;
