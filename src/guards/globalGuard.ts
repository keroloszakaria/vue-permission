import { hasPermission } from "../utils/permissionHelpers";
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

  const authState = getAuthState?.() ?? { isAuthenticated: false };
  const { isAuthenticated } = authState;

  // استخرج صلاحيات اليوزر من الـ authState
  const userPermissions =
    authState?.permissions || authState?.user?.permissions || [];

  const isAuthRoute = authRoutes.some((route) => route.path === to.path);
  const requiresAuth = to.meta?.requiresAuth;

  const hasAccess = async (): Promise<boolean> => {
    if (!to.meta?.checkPermission) return true;
    const requiredPermissions = to.meta?.permissions;
    if (!requiredPermissions || requiredPermissions === "*") return true;
    return await hasPermission(requiredPermissions, userPermissions);
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
        (await hasPermission(requiredPermissions, userPermissions))
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
