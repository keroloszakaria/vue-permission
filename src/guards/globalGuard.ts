import {
  hasPermission,
  getCurrentPermissions,
} from "../utils/permissionHelpers";
import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import type { GuardOptions } from "../types";

export async function globalGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
  options: GuardOptions = {}
) {
  const {
    authRoutes = [],
    protectedRoutes = [],
    getAuthState,
    loginPath = "/login",
    homePath = "/",
  } = options;

  // نستخدم getAuthState لو متوفر عشان نعرف حالة المصادقة، لو مش متوفر نفترض false
  const authState = getAuthState?.() ?? { isAuthenticated: false };

  const { isAuthenticated } = authState;

  // بدل قراءة صلاحيات من getAuthState، ناخدها من vue-permission مباشرة
  const currentPermissions = getCurrentPermissions();

  const isAuthRoute = authRoutes.some((route) => route.path === to.path);
  const requiresAuth = to.meta?.requiresAuth;

  const hasAccess = async (): Promise<boolean> => {
    if (!to.meta?.checkPermission) return true;
    const requiredPermissions = to.meta?.permissions;
    if (!requiredPermissions || requiredPermissions === "*") return true;
    return await hasPermission(requiredPermissions, currentPermissions);
  };

  const findAccessibleRoute = async (
    routes: any[],
    basePath = ""
  ): Promise<string | null> => {
    for (const route of routes) {
      const fullPath = basePath + route.path;
      const requiredPermissions = route.meta?.permissions;

      if (
        !requiredPermissions ||
        requiredPermissions === "*" ||
        (await hasPermission(requiredPermissions, currentPermissions))
      ) {
        return fullPath;
      }

      if (route.children?.length) {
        const child = await findAccessibleRoute(route.children, fullPath);
        if (child) return child;
      }
    }
    return null;
  };

  if (!isAuthenticated) {
    if (requiresAuth) return next(loginPath);
    return next();
  }

  if (isAuthRoute) return next(homePath);

  if (!(await hasAccess())) {
    const fallback = await findAccessibleRoute(protectedRoutes);
    return next(fallback || loginPath);
  }

  next();
}
