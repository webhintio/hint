import { ResourceType } from '../types/resource-type';

/**
 * Check if a name represents a full package name for the specified resource type.
 * E.g. for `hint` allowed values would be `@example/webhint-hint-foo` or
 * `webhint-hint-foo` (where `example` and `foo` are custom). Also allows internal
 * resource references for multi-hint scenarios (e.g. `webhint-hint-foo/subhint`).
 */
export const isFullPackageName = (packageName: string, type: ResourceType): boolean => {
    const parts = packageName.split('/');
    const name = parts.length >= 2 && parts[0].startsWith('@') ? parts[1] : packageName;

    if (parts[0] === '@hint') {
        return name.startsWith(`${type}-`);
    }

    return name.startsWith(`webhint-${type}-`);
};
