export { default as PermissionPlugin } from "./plugin";
export { vPermission } from "./directives/v-permission";
export { globalGuard } from "./guards/globalGuard";
export {
  hasPermission,
  configurePermission,
  initPermissionDirectiveIfNeeded,
} from "./utils/permissionHelpers";
export { clearPermissionCache } from "./utils/permissionCache";
export * from "./types";
