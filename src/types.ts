import type { Ref } from "vue";

export type PermissionMode =
  | "and"
  | "or"
  | "startWith"
  | "endWith"
  | "exact"
  | "regex";

export interface PermissionObject {
  permissions: string[];
  mode: PermissionMode;
}

export type PermissionValue = string | string[] | PermissionObject;
export type PermissionsArray = string[] | Ref<string[]>;

export interface GlobalConfig {
  permissions: PermissionsArray | null;
}

export interface PluginOptions {
  permissions?: PermissionsArray;
  developmentMode?: boolean;
}

export interface GuardOptions {
  authRoutes?: Array<{ path: string }>;
  protectedRoutes?: any[];
  getAuthState?: () => { isAuthenticated: boolean; user?: any };
  loginPath?: string;
  homePath?: string;
}

declare global {
  interface HTMLElement {
    _vPermissionOriginalDisplay?: string;
  }
}

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    checkPermission?: boolean;
    permissions?: PermissionValue;
    isAuthRoute?: boolean;
  }
}
