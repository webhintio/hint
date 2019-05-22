import { HTMLDocument, HTMLElement } from './html';

import { EventEmitter2 } from 'eventemitter2';

/* istanbul ignore next */
const traverseAndNotify = async (element: HTMLElement, document: HTMLDocument, engine: EventEmitter2, resource: string): Promise<void> => {

    await engine.emitAsync(`element::${element.nodeName.toLowerCase()}` as 'element::*', {
        element,
        resource
    });

    const traverseEvent = {
        element,
        resource
    };

    await engine.emitAsync(`traverse::down`, traverseEvent);

    // Recursively traverse child elements.
    for (const child of element.children) {
        await traverseAndNotify(child, document, engine, resource);
    }

    await engine.emitAsync(`traverse::up`, traverseEvent);
};

/**
 * Traverse an HTMLDocument.
 * @param {HTMLDocument} document - HTMLDocument to traverse.
 * @param {EventEmitter2} engine - EventEmitter used to notify the traversing. Usually is a Engine.
 * @param {string} resource - Resource that is being traversed.
 */
/* istanbul ignore next */
export const traverse = async (document: HTMLDocument, engine: EventEmitter2, resource: string): Promise<void> => {
    const documentElement = document.documentElement;

    const event = { resource };

    await engine.emitAsync('traverse::start', event);
    await traverseAndNotify(documentElement, document, engine, resource);
    await engine.emitAsync('traverse::end', event);
};
