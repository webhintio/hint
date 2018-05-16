import { ResourceErrorStatus } from '../enums/errorstatus';

export class ResourceError extends Error {
    public status: ResourceErrorStatus;

    public constructor(error: Error, status: ResourceErrorStatus, message?: string) {
        super(error.message);
        this.message = message || error.message;
        this.name = 'ResourceError';
        this.stack = error.stack;
        this.status = status;
    }
}
