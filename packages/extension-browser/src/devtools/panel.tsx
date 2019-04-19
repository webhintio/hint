import * as React from 'react';
import { render } from 'react-dom';

import { setup, trackShow } from './utils/analytics';

require('focus-visible');

import App from './views/app';

render(<App/>, document.getElementById('webhint-root'));

// Initialize analytics and increment count of the "Hints" tab being shown.
setup();
trackShow();
