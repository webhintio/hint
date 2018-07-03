import { ResourceErrorStatus } from '../enums/errorstatus';

export class ResourceError extends Error {
    public status: ResourceErrorStatus;

    public constructor(error: Error | string, status: ResourceErrorStatus) {
        const message: string = typeof error === 'string' ? error : error.message;

        super(message);

        this.name = 'ResourceError';
        this.status = status;
    }
}
