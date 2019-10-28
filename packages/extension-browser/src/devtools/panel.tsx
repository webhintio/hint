import * as React from 'react';
import { render } from 'react-dom';

import { setup, trackShow } from './utils/analytics';

require('focus-visible');

import App from './views/app';

const props = (window as any).initialState || {};

render(<App {...props}/>, document.getElementById('webhint-root'));

// Initialize analytics and increment count of the "Hints" tab being shown.
setup();
trackShow();
