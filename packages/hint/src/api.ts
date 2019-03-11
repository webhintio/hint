/**
 * @fileoverview Hint API. Allows users to have access to methods and utils
 * inside hint
 */

/*
 * Engine
 */

export * from './lib/engine';
/*
 * Types
 */

export * from './lib/types';

/*
 * Utils - DOM
 */

import * as u from './lib/utils/index';

export const utils = u;
