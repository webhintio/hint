import { AnalyzerErrorStatus } from '../enums/error-status';
import { HintResources } from '../types';

export class AnalyzerError extends Error {
    public status: AnalyzerErrorStatus;
    public resources?: HintResources;
    public invalidHints?: string[];

    public constructor(error: Error | string, status: AnalyzerErrorStatus, items?: HintResources | string[]) {
        const message: string = typeof error === 'string' ? error : error.message;

        super(message);

        this.name = 'AnalyzerError';
        this.status = status;

        switch (status) {
            case AnalyzerErrorStatus.ResourceError:
                this.resources = items as HintResources;
                break;
            case AnalyzerErrorStatus.HintError:
                this.invalidHints = items as string[];
                break;
            default:
                break;
        }
    }
}
