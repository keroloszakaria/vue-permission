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

  const isAuthRoute = authRoutes.some((route) => route.path === to.path);
  const requiresAuth = to.meta?.requiresAuth;

  const hasAccess = async (): Promise<boolean> => {
    if (!to.meta?.checkPermission) return true;
    const permissions = to.meta?.permissions;
    if (!permissions || permissions === "*") return true;
    return await hasPermission(permissions);
  };

  const findAccessibleRoute = async (
    routes: any[],
    basePath = ""
  ): Promise<string | null> => {
    for (const route of routes) {
      const fullPath = basePath + route.path;
      const permissions = route.meta?.permissions;

      if (
        !permissions ||
        permissions === "*" ||
        (await hasPermission(permissions))
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
