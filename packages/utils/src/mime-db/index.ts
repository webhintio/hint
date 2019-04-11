export type MimeEntry = {
    charset?: string;
    extensions?: string[];
}

export type MimeDB = {
    [type: string]: MimeEntry;
};

const mimeDB: MimeDB = require('./db.json');

export default mimeDB;
