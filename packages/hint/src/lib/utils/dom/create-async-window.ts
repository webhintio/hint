import { IAsyncWindow } from '../../types/async-html';
import { JSDOMAsyncWindow } from '../../types/jsdom-async-html';
import createJsdom from './create-jsdom';

export default (html: string, allowScripts: boolean = false): IAsyncWindow => {
    const dom = createJsdom(html, allowScripts);

    return new JSDOMAsyncWindow(dom.window, dom);
};
