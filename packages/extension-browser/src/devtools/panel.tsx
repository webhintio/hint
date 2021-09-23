import * as React from 'react';
import { render } from 'react-dom';

require('focus-visible');

import App from './views/app';

const props = (window as any).initialState || {};

render(<App {...props}/>, document.getElementById('webhint-root'));
