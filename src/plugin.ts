import type { App } from "vue";
import { vPermission } from "./directives/v-permission";
import {
  configurePermission,
  initPermissionDirectiveIfNeeded,
} from "./utils/permissionHelpers";

export default {
  install(
    app: App,
    options?: { permissions?: string[]; developmentMode?: boolean }
  ) {
    if (options?.permissions) {
      configurePermission(options.permissions, {
        developmentMode: options.developmentMode,
      });
    } else {
      initPermissionDirectiveIfNeeded();
    }
    app.directive("permission", vPermission);
  },
};
