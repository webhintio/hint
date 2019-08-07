import test from 'ava';
import * as pq from 'proxyquire';

const proxyquire = pq.noCallThru().noPreserveCache();

type Messages = {
    [key: string]: string;
};

type Locales = {
    [key: string]: Messages;
}

type Packages = {
    [key: string]: Locales;
}

const mock = (packages: Packages): typeof import('../../src/i18n/get-message').getMessage => {
    const paths = {} as any;

    for (const [pkg, locales] of Object.entries(packages)) {
        for (const [locale, messages] of Object.entries(locales)) {
            const msgs = {} as any;

            if (messages) {
                for (const [name, value] of Object.entries(messages)) {
                    msgs[name] = { message: value };
                }
            }

            paths[`${pkg}/_locales/${locale}/messages.json`] = messages && msgs;
        }
    }

    return proxyquire('../../src/i18n/get-message', paths).getMessage;
};

test('It gets a string for the provided key in the specified locale', (t) => {
    const getMessage = mock({
        [__dirname]: {
            en: { foo: 'color' },
            'en-gb': { foo: 'colour' }
        }
    });

    const message = getMessage('foo', __dirname, { language: 'en-gb' });

    t.is(message, 'colour');
});

test('It defaults to "en" if no locale is specified', (t) => {
    const getMessage = mock({
        [__dirname]: {
            en: { foo: 'color' },
            'en-gb': { foo: 'colour' }
        }
    });

    const message = getMessage('foo', __dirname);

    t.is(message, 'color');
});

test('It falls back to the base locale if the specified dialect is not avaiable', (t) => {
    const getMessage = mock({
        [__dirname]: {
            es: { foo: 'bar (es)' },
            'es-es': { foo: 'bar (es-es)' }
        }
    });

    const message = getMessage('foo', __dirname, { language: 'es-mx' });

    t.is(message, 'bar (es)');
});

test('It falls back to "en" if the specified locale is not available', (t) => {
    const getMessage = mock({
        [__dirname]: {
            en: { foo: 'bar (en)' },
            'en-us': { foo: 'bar (en-us)' }
        }
    });

    const message = getMessage('foo', __dirname, { language: 'foo-bar' });

    t.is(message, 'bar (en)');
});

test('It throws if no localization file is available', (t) => {
    const getMessage = mock({ [__dirname]: {} });

    t.throws(() => {
        getMessage('foo', __dirname, { language: 'foo-bar' });
    });
});

test('It returns the key if no localization entry is available', (t) => {
    const getMessage = mock({ [__dirname]: { en: { foo: 'bar (en)' } } });

    const message = getMessage('foobar', __dirname);

    t.is(message, 'foobar');
});

test('It supports substitutions', (t) => {
    const getMessage = mock({ [__dirname]: { en: { foo: 'bar $1' } } });

    const message = getMessage('foo', __dirname, { substitutions: ['baz'] });

    t.is(message, 'bar baz');
});
