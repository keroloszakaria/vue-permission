const STORAGE_KEY = "__v_permission__";

const encrypt = (value: any): string => btoa(JSON.stringify(value));
const decrypt = (value: string): any => JSON.parse(atob(value));

export const savePermissionsToStorage = (permissions: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, encrypt(permissions));
  } catch (e) {
    console.warn("[v-permission] Failed to save permissions to storage:", e);
  }
};

export const getPermissionsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? decrypt(stored) : null;
  } catch (e) {
    console.warn("[v-permission] Failed to read permissions from storage:", e);
    return null;
  }
};

export const clearPermissionsFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("[v-permission] Failed to clear permissions from storage:", e);
  }
};
