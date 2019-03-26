import { HTMLDocument, HTMLElement } from '../../types/html';
import { TraverseUp, TraverseDown, Event } from '../../types/events';

import { EventEmitter2 } from 'eventemitter2';

const traverseAndNotify = async (element: HTMLElement, document: HTMLDocument, engine: EventEmitter2, resource: string): Promise<void> => {

    await engine.emitAsync(`element::${element.nodeName.toLowerCase()}` as 'element::*', {
        element,
        resource
    });

    const traverseEvent = {
        element,
        resource
    } as TraverseDown | TraverseUp;

    await engine.emitAsync(`traverse::down`, traverseEvent);

    // Recursively traverse child elements.
    for (const child of element.children) {
        await traverseAndNotify(child, document, engine, resource);
    }

    await engine.emitAsync(`traverse::up`, traverseEvent);
};

export const traverse = async (document: HTMLDocument, engine: EventEmitter2, resource: string): Promise<void> => {
    const documentElement = document.documentElement;

    const event = { resource } as Event;

    await engine.emitAsync('traverse::start', event);
    await traverseAndNotify(documentElement, document, engine, resource);
    await engine.emitAsync('traverse::end', event);
};
