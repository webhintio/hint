import { JSDOMAsyncHTMLElement } from '../../types/jsdom-async-html';
import { JSDOM } from 'jsdom';
import { Engine } from '../../engine';
import { TraverseUp, TraverseDown, Event } from '../../types/events';

const traverseAndNotify = async (element: HTMLElement, dom: JSDOM, engine: Engine, resource: string): Promise<void> => {

    await engine.emitAsync(`element::${element.tagName.toLowerCase()}` as 'element::*', {
        element: new JSDOMAsyncHTMLElement(element, dom),
        resource
    });

    const traverseEvent = {
        element: new JSDOMAsyncHTMLElement(element, dom),
        resource
    } as TraverseDown | TraverseUp;

    await engine.emitAsync(`traverse::down`, traverseEvent);

    // Recursively traverse child elements.
    for (let i = 0; i < element.children.length; i++) {
        await traverseAndNotify(element.children[i] as HTMLElement, dom, engine, resource);
    }

    await engine.emitAsync(`traverse::up`, traverseEvent);
};

export default async (dom: JSDOM, engine: Engine, resource: string): Promise<void> => {
    const documentElement = dom.window.document.documentElement;

    const event = { resource } as Event;

    await engine.emitAsync('traverse::start', event);
    await traverseAndNotify(documentElement, dom, engine, resource);
    await engine.emitAsync('traverse::end', event);
};
