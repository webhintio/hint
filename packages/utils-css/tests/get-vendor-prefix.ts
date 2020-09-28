import { getVendorPrefix } from '../src/get-vendor-prefix';
import test from 'ava';

test(`Returns vendor prefix`, (t) => {
    const expected = '-moz-';

    t.is(getVendorPrefix('-moz-animation'), expected);
});
