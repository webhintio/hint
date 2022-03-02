import type { SpawnOptions } from 'child_process';

export function exec(cmd: string, options?: SpawnOptions): Promise<{stdout: string}>;
export function execWithRetry(command: string, options?: SpawnOptions, allowedRetries?: number): Promise<{stdout: string}>;
