import test from 'ava';

import isDataURI from '../../../../src/lib/utils/network/is-data-uri';

test('isDataUri detects if the URL is a data URI or not', (t) => {
    const noDataUri = 'https://myresource.com/';
    const dataUri = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D';

    t.false(isDataURI(noDataUri), `isDataUri doesn't detect correctly ${noDataUri} is not a data URI`);
    t.true(isDataURI(dataUri), `isDataUri doesn't detect correctly ${dataUri} is a data URI`);
});
