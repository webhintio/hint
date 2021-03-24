import { getUnprefixed } from '../src/get-unprefixed';
import test from 'ava';

test(`Returns vendor prefix`, (t) => {
    const expected = 'animation';

    t.is(getUnprefixed('-moz-animation'), expected);
});
