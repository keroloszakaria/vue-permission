import type { DirectiveBinding } from "vue";
import { hasPermission } from "../utils/permissionHelpers";

export const vPermission = {
  async mounted(el: HTMLElement, binding: DirectiveBinding) {
    const value = binding.value;
    const allowed = await hasPermission(value);

    if (!allowed) {
      el._vPermissionOriginalDisplay = el.style.display;
      el.style.display = "none";
    }
  },

  async updated(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.value !== binding.oldValue) {
      const allowed = await hasPermission(binding.value);
      el.style.display = allowed
        ? el._vPermissionOriginalDisplay || ""
        : "none";
    }
  },

  unmounted(el: HTMLElement) {
    el._vPermissionOriginalDisplay = undefined;
  },
};
