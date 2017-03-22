// /**
//  * @fileoverview Collector that uses the Chrome Debugging protocol to load a site and do the traversing. It also uses [request](https:/github.com/request/request) to
//  * download the external resources (JS, CSS, images). *
//  */

// // ------------------------------------------------------------------------------
// // Requirements
// // ------------------------------------------------------------------------------

// import * as url from 'url';
// import * as cdp from 'chrome-remote-interface';

// const debug = require('debug')('sonar:collector:jsdom');

// import * as logger from '../util/logging';


// import { Sonar } from '../sonar'; // eslint-disable-line no-unused-vars
// import { Collector, CollectorBuilder, ElementFoundEvent, NetworkData, URL } from '../types'; // eslint-disable-line no-unused-vars

// // ------------------------------------------------------------------------------
// // Defaults
// // ------------------------------------------------------------------------------

// const defaultOptions = { waitFor: 5000 };

// const builder: CollectorBuilder = (server: Sonar, config): Collector => {

//     const options = Object.assign({}, defaultOptions, config);
//     const headers = options.headers;

//     let _html, _headers, _dom;

//     return ({
//         async collect(target: URL) {
//             const href = target.href;

//             const traverseAndNotify = async (element) => {

//                 const eventName = `element::${element.localName}`;

//                 debug(`emitting ${eventName}`);
//                 // should we freeze it? what about the other siblings, children, parents? We should have an option to not allow modifications
//                 // maybe we create a custom object that only exposes read only properties?
//                 const event: ElementFoundEvent = {
//                     element,
//                     resource: href
//                 };

//                 await server.emitAsync(eventName, event);
//                 for (const child of element.children) {

//                     debug('next children');
//                     await server.emitAsync(`traversing::down`, href);
//                     await traverseAndNotify(child);  // eslint-disable-line no-await-for

//                 }
//                 await server.emitAsync(`traversing::up`, href);

//                 return Promise.resolve();

//             };


//             // Start browser here somehow (look for a package?)
//             const client = await cdp();

//             const { DOM, Network, Page } = client;

//             Network.requestWillbeSent(async (params) => {
//                 const requestUrl = params.request.url;

//                 debug(`About to start fetching ${requestUrl}`);
//                 await server.emitAsync('targetfetch::start', requestUrl);
//             });

//             Page.loadEventFired(() => {
//                 //Traverse of dom here
//                 const dom = DOM.getDocument(-1);
//                 client.close();
//             });


//             return new Promise(async (resolve, reject) => {

//                 const traverseAndNotify = async (element) => {

//                     const eventName = `element::${element.localName}`;

//                     debug(`emitting ${eventName}`);
//                     // should we freeze it? what about the other siblings, children, parents? We should have an option to not allow modifications
//                     // maybe we create a custom object that only exposes read only properties?
//                     const event: ElementFoundEvent = {
//                         element,
//                         resource: href
//                     };

//                     await server.emitAsync(eventName, event);
//                     for (const child of element.children) {

//                         debug('next children');
//                         await server.emitAsync(`traversing::down`, href);
//                         await traverseAndNotify(child);  // eslint-disable-line no-await-for

//                     }
//                     await server.emitAsync(`traversing::up`, href);

//                     return Promise.resolve();

//                 };

//                 debug(`About to start fetching ${href}`);
//                 await server.emitAsync('targetfetch::start', href);
//             });
//         },
//         get dom(): HTMLElement {
//             return _dom;
//         },
//         /** Fetches a resource. It could be a file:// or http(s):// one.
//          *
//          * If target is:
//          * * a URL and doesn't have a valid protocol it will fail.
//          * * a string, if it starts with // it will treat it as a url, and as a file otherwise
//          *
//          * It will return an object with the body of the resource, the headers of the response and the
//          * original bytes (compressed if applicable)
//          */
//         fetchContent(target: URL | string, customHeaders?: object) {
//             //TODO: something here to return the content
//             return Promise.resolve({});
//         },
//         get headers(): object {
//             return _headers;
//         },
//         get html(): string {
//             return _html;
//         }
//     });

// };

// module.exports = builder;
