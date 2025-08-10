import { isRef } from "vue";
import type { GlobalConfig, PermissionsArray, PermissionValue } from "../types";
import {
  getCachedPermission,
  setCachedPermission,
  clearPermissionCache,
} from "./permissionCache";
import {
  getPermissionsFromStorage,
  savePermissionsToStorage,
} from "./permissionStorage";

let globalConfig: GlobalConfig = { permissions: null };
let isDevelopmentMode = false;

export const configurePermission = (
  permissions: PermissionsArray,
  options?: { developmentMode?: boolean }
) => {
  globalConfig.permissions = permissions;
  isDevelopmentMode = options?.developmentMode ?? false;
  clearPermissionCache();
  savePermissionsToStorage(permissions);
};

export const initPermissionDirectiveIfNeeded = () => {
  const stored = getPermissionsFromStorage();
  if (stored) configurePermission(stored);
};

export const getCurrentPermissions = (): string[] => {
  const { permissions } = globalConfig;
  return isRef(permissions) ? permissions.value : permissions ?? [];
};

export const hasPermission = async (
  permissionValue: PermissionValue,
  userPermissions?: string[]
): Promise<boolean> => {
  const currentPermissions = userPermissions ?? getCurrentPermissions();

  // استخدم كاش يعتمد على permissionValue مع الصلاحيات الحالية
  const cacheKey = JSON.stringify({ permissionValue, currentPermissions });
  const cached = getCachedPermission(cacheKey);
  if (cached !== null) return cached;

  const evaluate = async (value: PermissionValue): Promise<boolean> => {
    if (typeof value === "string") {
      // صلاحية واحدة - تحقق إذا موجودة في الصلاحيات
      return currentPermissions.includes(value);
    }

    if (Array.isArray(value)) {
      // مصفوفة صلاحيات - نتحقق إذا تحقق على الأقل واحد منهم
      const results = await Promise.all(
        value.map((p) => hasPermission(p, currentPermissions))
      );
      return results.some(Boolean);
    }

    if (typeof value === "object" && value.permissions && value.mode) {
      // تحقق حسب نوع المطابقة (and, or, regex, startWith,...)
      const { permissions, mode } = value;

      const checks = {
        and: () => permissions.every((p) => currentPermissions.includes(p)),
        or: () => permissions.some((p) => currentPermissions.includes(p)),
        startWith: () =>
          permissions.some((p) =>
            currentPermissions.some((u) => u.startsWith(p))
          ),
        endWith: () =>
          permissions.some((p) =>
            currentPermissions.some((u) => u.endsWith(p))
          ),
        exact: () => permissions.some((p) => currentPermissions.includes(p)),
        regex: () =>
          permissions.some((p) => {
            try {
              const r = new RegExp(p);
              return currentPermissions.some((u) => r.test(u));
            } catch (e) {
              if (isDevelopmentMode) {
                console.warn("[v-permission] Invalid regex:", p, e);
              }
              return false;
            }
          }),
      };

      return checks[mode]?.() ?? false;
    }

    if (isDevelopmentMode) {
      console.warn("[v-permission] Invalid permission value:", value);
    }
    return false;
  };

  const result = await evaluate(permissionValue);
  setCachedPermission(cacheKey, result);
  return result;
};
