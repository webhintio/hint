const jsdom = require('jsdom'),
    request = require('request');

const debug = require('debug')('sonar:collector:jsdom');


module.exports = server => ({
    async collect(target) {
        debug(`About to start fetching ${target}`);
        await server.emitAsync('url');

        const traverseAndNotify = async (element) => {
            const eventName = `element::${element.localName}`;
            debug(`emitting ${eventName}`);
            // TODO: calculate the line and position of the element in the HTML and send it with the event
            // should we freeze it? what about the other siblings, children, parents? We should have an option to not allow modifications
            // maybe we create a custom object that only exposes read only properties?
            await server.emitAsync(eventName, element);
            for (const child of element.children) {
                debug('next children');
                await traverseAndNotify(child);  //eslint-disable-line
            }

            return Promise.resolve();
        };

        return new Promise((resolve, reject) => {
            jsdom.env({
                url: target,
                async resourceLoader(resource, callback) {
                    const pathname = resource.url.pathname;
                    debug(`resource ${pathname} to be fetched`);
                    await server.emitAsync('fetch::start', pathname);

                    return resource.defaultFetch(async (err, body) => {
                        debug(`resource ${pathname} fetched`);
                        if (err) return callback(err);
                        const headers = {}; // TODO: when using request instead of default fetch, this will be the headers of the response
                        await server.emitAsync('fetch::end', pathname, body, headers);
                        return callback(null, body);
                    });
                },
                features: {
                    FetchExternalResources: ['script', 'link', 'img'],
                    ProcessExternalResources: ['script'],
                    SkipExternalResources: false
                },
                done(err, window) {
                    if (err) {
                        return reject(err);
                    }
                    debug(`${target} loaded, traversing`);

                    server.sourceHtml = window.document.children[0].outerHTML;

                    return server.emitAsync('traverse::start', target)
                        .then(() => traverseAndNotify(window.document.children[0]))
                        .then(() => server.emitAsync('traverse::end', target))
                        // TODO: find a way to call when everything is finished. Here we have just finished traversing but we might be loading other resources or doing something else...
                        .then(() => resolve());
                }
            });
        });
    },
    request // we should do somethign here
});
