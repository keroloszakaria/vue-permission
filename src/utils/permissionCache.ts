const permissionCache = new Map<string, boolean>();

export const getCachedPermission = (key: string) =>
  permissionCache.has(key) ? permissionCache.get(key)! : null;

export const setCachedPermission = (key: string, value: boolean) =>
  permissionCache.set(key, value);

export const clearPermissionCache = () => permissionCache.clear();
