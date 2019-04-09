import test from 'ava';
import { JSDOM } from 'jsdom';

import { createHelpers, restoreReferences } from '../../src/dom/snapshot';
import { DocumentData, ElementData } from '../../src/types/snapshot';

const createSnapshot = (location = false): [DocumentData, JSDOM] => {
    const html = `<!doctype html>
<html>
    <body>
        <h1>Title</h1>
        <p>Content</p>
    </body>
</html>`;

    const dom = new JSDOM(html, {
        includeNodeLocations: location,
        runScripts: 'outside-only'
    });

    dom.window.eval(`(${createHelpers})()`);

    if (location) {
        (dom.window as any).__webhint.nodeLocation = (node: Node) => {
            return dom.nodeLocation(node);
        };
    }

    return [dom.window.eval('__webhint.snapshotDocument()') as any, dom];
};

test('Create a snapshot', (t) => {
    const [snapshot] = createSnapshot();

    t.is(snapshot.type, 'root');
});

test('Create a snapshot with location', (t) => {
    const [snapshot] = createSnapshot(true);

    const html = snapshot.children.filter((c) => {
        return c.type === 'tag' && c.name === 'html';
    })[0] as ElementData;

    const location = html.sourceCodeLocation;

    t.is(location && location.startLine, 2);
    t.is(location && location.startCol, 1);
});

test('Restore references', (t) => {
    const [snapshot] = createSnapshot();

    restoreReferences(snapshot);

    t.is(snapshot.children[0].parent, snapshot);
    t.is(snapshot.children[0].prev, null);
    t.is(snapshot.children[0].next, snapshot.children[1]);
    t.is(snapshot.children[1].prev, snapshot.children[0]);
    t.is(snapshot.children[snapshot.children.length - 1].next, null);
});

test('Find an element', (t) => {
    const [snapshot, dom] = createSnapshot();

    restoreReferences(snapshot);

    const html = snapshot.children.filter((c) => {
        return c.type === 'tag' && c.name === 'html';
    })[0] as ElementData;

    const body = html.children.filter((c) => {
        return c.type === 'tag' && c.name === 'body';
    })[0] as ElementData;

    const h1 = body.children.filter((c) => {
        return c.type === 'tag' && c.name === 'h1';
    })[0] as ElementData;

    const targetH1 = dom.window.eval('document.querySelector("h1")');
    const foundH1 = dom.window.eval(`__webhint.findNode(${h1.id})`);

    t.is(foundH1, targetH1);
});
