import { URL } from 'url';

export class RedirectError extends Error {
    public newUrl: URL;

    public constructor(message: string, url: URL) {
        super(message);

        this.newUrl = url;
        this.name = 'RedirectError';

        // Remove the constructor in the error stack trace.
        Error.captureStackTrace(this, RedirectError);
    }
}
