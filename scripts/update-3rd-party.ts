import * as path from 'path';
import * as fs from 'fs';
import fetch from 'node-fetch';

import { compile } from 'json-schema-to-typescript';

type Transform = {
    pattern: string;
    replacement: string;
} | ((content: string, location: string) => Promise<string> | string);

const cleanSchemaObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') {
        return;
    }

    // Disallow additional properties
    if (obj.properties && !('additionalProperties' in obj)) {
        obj.additionalProperties = false;
    }

    // Make definition refs local
    if (obj && obj.$ref && obj.$ref.startsWith('https://')) {
        obj.$ref = `#${obj.$ref.split('#')[1]}`;
    }

    Object.values(obj).forEach(cleanSchemaObject);
};

/**
 * Flatten remotely referenced schemas into a single, combined schema.
 * Handles merging `properties` and `definitions` from a root `allOf`.
 */
const inlineRemoteRefs = async (json: any): Promise<void> => {
    for (const entry of json.allOf) {
        if (entry.$ref && entry.$ref.startsWith('https://')) {
            const res = await fetch(entry.$ref);

            if (res.body && (res.body as any).message) {
                throw new Error((res.body as any).message);
            }

            const refJson = await res.json();

            json.properties = { ...json.properties, ...refJson.properties };
            json.definitions = { ...json.definitions, ...refJson.definitions };
        }
    }

    delete json.allOf;
};

/**
 * Prepare the manifest schema for use as a single file.
 * Also generate associated TypeScript interfaces.
 */
const prepManifestSchema = async (content: string, location: string): Promise<string> => {
    const schema = JSON.parse(content);

    schema.title = 'Manifest';
    await inlineRemoteRefs(schema);
    cleanSchemaObject(schema);

    const ts = await compile(schema, 'Manifest');

    await fs.promises.writeFile(location.replace('.json', '.ts'), `/* eslint-disable */\n${ts}`);

    return JSON.stringify(schema, null, 4);
};

/**
 * ajv 7 doesn't support property id. It uses $id.
 */
const replaceId = (content: string, location: string): string => {
    const schema = JSON.parse(content);

    if (!('$id' in schema)) {
        schema.$id = schema.id;
    }

    if ('id' in schema) {
        delete schema.id;
    }

    return JSON.stringify(schema, null, 4);
};

const downloadFile = async (downloadURL: string, downloadLocation: string, transforms: Transform[] = []) => {
    const res = await fetch(downloadURL);

    if (res.body && (res.body as any).message) {
        throw new Error((res.body as any).message);
    }

    let body = await res.text();

    for (const transform of transforms) {
        if (typeof transform === 'function') {
            body = await transform(body, downloadLocation);
        } else {
            body = body.replace(transform.pattern, transform.replacement);
        }
    }

    fs.writeFileSync(downloadLocation, body, 'utf-8'); // eslint-disable-line no-sync
};

const resources = new Map([
    ['packages/hint-performance-budget/src/connections.ini', 'https://raw.githubusercontent.com/WPO-Foundation/webpagetest/master/www/settings/connectivity.ini.sample'],
    ['packages/hint-no-vulnerable-javascript-libraries/src/snyk-snapshot.json', 'https://snyk.io/partners/api/v2/vulndb/clientside.json'],
    ['packages/parser-manifest/src/schema.json', 'https://json.schemastore.org/web-manifest-combined'],
    ['packages/parser-typescript-config/src/schema.json', 'https://json.schemastore.org/tsconfig']
]);

// AJV uses draft-07 and otherwise tests break
const replaceDraft04 = { pattern: 'draft-04', replacement: 'draft-07' };

const resourceTransforms = new Map([
    ['packages/parser-manifest/src/schema.json', [replaceDraft04, prepManifestSchema, replaceId]],
    ['packages/parser-typescript-config/src/schema.json', [replaceDraft04, replaceId]]
]);

const updateEverything = async () => {
    for (const [route, uri] of resources) {
        const message = `Updating ${route}`;

        console.log(message);

        try {
            const transform = resourceTransforms.get(route);

            await downloadFile(uri, path.normalize(route), transform);

        } catch (e) {
            console.error(`Error downloading ${uri}`, e);

            throw e;
        }
    }
};

updateEverything();
