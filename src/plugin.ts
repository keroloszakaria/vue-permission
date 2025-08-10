import type { App } from "vue";
import { vPermission } from "./directives/v-permission";
import {
  configurePermissionDirective,
  initPermissionDirectiveIfNeeded,
} from "./utils/permissionHelpers";

export default {
  install(
    app: App,
    options?: { permissions?: string[]; developmentMode?: boolean }
  ) {
    if (options?.permissions) {
      configurePermissionDirective(options.permissions, {
        developmentMode: options.developmentMode,
      });
    } else {
      initPermissionDirectiveIfNeeded();
    }
    app.directive("permission", vPermission);
  },
};
