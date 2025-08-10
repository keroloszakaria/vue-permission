# 🔐 vue-permission

A powerful, flexible permission management plugin for Vue 3  
Provides a declarative directive (`v-permission`), route protection (`globalGuard`), permission evaluation utilities, encrypted storage, and caching.

---

## 🚀 Features

- ✅ **`v-permission` directive**: show/hide/remove elements based on permissions
- 🛡️ **Route guard** `globalGuard` with fallback redirection
- ⚡ **Performance**: Fast with permission caching
- 🔀 **Complex logic**: Supports `and`, `or`, `regex`, `startWith`, `exact`, etc.
- 🔒 **Security**: Stores encrypted permissions in `localStorage`
- 🔧 **Flexible**: Simple API & customizable behavior
- 📱 **Reactive**: Works with both static arrays or reactive `Ref<string[]>`
- 🎯 **TypeScript**: Full TypeScript support

---

## 📦 Installation

```bash
npm install vue-permission
# or
yarn add vue-permission
# or
pnpm add vue-permission
```

---

## 🧩 Quick Setup

### Vue 3 App

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { PermissionPlugin } from "vue-permission";

const app = createApp(App);

app.use(PermissionPlugin, {
  permissions: ["user.create", "user.view", "admin.panel"],
  developmentMode: process.env.NODE_ENV === "development",
});

app.mount("#app");
```

### Nuxt 3

```ts
// plugins/vue-permission.client.ts
import { defineNuxtPlugin } from "#app";
import { PermissionPlugin } from "vue-permission";

export default defineNuxtPlugin((nuxtApp) => {
  // Get permissions from your auth store/API
  const permissions = ["user.view", "user.edit"];

  nuxtApp.vueApp.use(PermissionPlugin, {
    permissions,
    developmentMode: process.env.NODE_ENV === "development",
  });
});
```

---

## 🎯 Using `v-permission` Directive

### Basic Usage

```vue
<template>
  <!-- Remove element if permission is missing -->
  <button v-permission="'user.create'">Create User</button>

  <!-- Multiple permissions (OR logic) -->
  <button v-permission="['user.edit', 'user.update']">Edit User</button>

  <!-- Hide instead of remove -->
  <div v-permission:show="'admin.panel'">Admin Panel</div>
</template>
```

### Advanced Configuration

```vue
<template>
  <!-- Require ALL permissions (AND logic) -->
  <button
    v-permission="{ permissions: ['user.edit', 'admin.users'], mode: 'and' }"
  >
    Advanced Edit
  </button>

  <!-- Regex pattern matching -->
  <div v-permission="{ permissions: ['^admin\\..*'], mode: 'regex' }">
    Any Admin Permission
  </div>

  <!-- Exact match only -->
  <button v-permission="{ permissions: ['user'], mode: 'exact' }">
    Exact Match
  </button>

  <!-- Start with pattern -->
  <nav v-permission="{ permissions: ['menu.'], mode: 'startWith' }">
    Navigation Menu
  </nav>
</template>
```

### Directive Modifiers

| Modifier | Description                                   | Example                           |
| -------- | --------------------------------------------- | --------------------------------- |
| `:show`  | Hide with `display: none` instead of removing | `v-permission:show="'user.view'"` |
| `.once`  | Check permission only once on mount           | `v-permission.once="'user.view'"` |
| `.lazy`  | Don't react to permission changes             | `v-permission.lazy="'user.view'"` |

```vue
<template>
  <!-- Combined modifiers -->
  <div v-permission:show.once="'user.dashboard'">
    Dashboard (hidden, checked once)
  </div>
</template>
```

---

## 🧭 Route Protection

### Setup Router Guard

```ts
// router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { globalGuard } from "vue-permission";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      component: () => import("@/views/Login.vue"),
      meta: { isAuthRoute: true },
    },
    {
      path: "/dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: {
        requiresAuth: true,
        checkPermission: true,
        permissions: ["dashboard.view"],
      },
    },
    {
      path: "/admin",
      component: () => import("@/views/Admin.vue"),
      meta: {
        requiresAuth: true,
        checkPermission: true,
        permissions: { permissions: ["admin.*"], mode: "regex" },
      },
    },
  ],
});

// Configure the guard
router.beforeEach((to, from, next) => {
  globalGuard(to, from, next, {
    authRoutes: [{ path: "/login" }, { path: "/register" }],
    protectedRoutes: router.options.routes,
    getAuthState: () => {
      // Return your auth state
      const authStore = useAuthStore(); // or your auth logic
      return {
        isAuthenticated: authStore.isAuthenticated,
        user: authStore.user,
      };
    },
  });
});

export default router;
```

### Route Meta Options

| Property          | Type                                     | Description                                   |
| ----------------- | ---------------------------------------- | --------------------------------------------- |
| `requiresAuth`    | `boolean`                                | Redirect unauthenticated users to login       |
| `checkPermission` | `boolean`                                | Enable permission checking for this route     |
| `permissions`     | `string \| string[] \| PermissionObject` | Required permissions                          |
| `isAuthRoute`     | `boolean`                                | Mark as authentication route (login/register) |

```ts
// Example route configurations
const routes = [
  {
    path: "/users",
    component: UsersList,
    meta: {
      requiresAuth: true,
      checkPermission: true,
      permissions: ["users.view"], // Simple permission
    },
  },
  {
    path: "/settings",
    component: Settings,
    meta: {
      requiresAuth: true,
      checkPermission: true,
      permissions: ["settings.view", "admin.panel"], // OR logic
    },
  },
  {
    path: "/advanced-admin",
    component: AdvancedAdmin,
    meta: {
      requiresAuth: true,
      checkPermission: true,
      permissions: {
        // Complex logic
        permissions: ["admin.advanced", "super.user"],
        mode: "and",
      },
    },
  },
];
```

---

## 🧠 Permission Checking Utilities

### `hasPermission()` Function

```ts
import { hasPermission } from "vue-permission";

// In component
export default {
  async mounted() {
    // Simple check
    const canEdit = await hasPermission("user.edit");

    // Multiple permissions (OR)
    const canAccess = await hasPermission(["user.view", "admin.panel"]);

    // Complex logic
    const isAdmin = await hasPermission({
      permissions: ["admin.*"],
      mode: "regex",
    });

    // Use in template
    this.showEditButton = canEdit;
  },
};
```

```vue
<!-- In Composition API -->
<script setup>
import { ref, onMounted } from "vue";
import { hasPermission } from "vue-permission";

const canCreateUser = ref(false);

onMounted(async () => {
  canCreateUser.value = await hasPermission("user.create");
});
</script>

<template>
  <button v-if="canCreateUser">Create User</button>
</template>
```

---

## ⚙️ Configuration & Management

### Dynamic Permission Updates

```ts
import { configurePermissionDirective } from "vue-permission";

// After login
async function login(credentials) {
  const response = await api.login(credentials);
  const userPermissions = response.user.permissions;

  // Update permissions
  configurePermissionDirective(userPermissions, {
    developmentMode: process.env.NODE_ENV === "development",
  });
}

// After logout
function logout() {
  configurePermissionDirective([], {
    developmentMode: process.env.NODE_ENV === "development",
  });
}
```

### Reactive Permissions with Pinia/Vuex

```ts
// stores/auth.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { configurePermissionDirective } from "vue-permission";

export const useAuthStore = defineStore("auth", () => {
  const permissions = ref<string[]>([]);

  function setPermissions(newPermissions: string[]) {
    permissions.value = newPermissions;
    configurePermissionDirective(permissions); // Pass reactive ref
  }

  return { permissions, setPermissions };
});
```

### Cache Management

```ts
import { clearPermissionCache } from "vue-permission";

// Clear cache when permissions change
function updateUserRole() {
  clearPermissionCache(); // Clear to force re-evaluation
  configurePermissionDirective(newPermissions);
}
```

---

## 🎨 Permission Modes

| Mode        | Description                      | Example                                                      |
| ----------- | -------------------------------- | ------------------------------------------------------------ |
| `or`        | Any permission matches (default) | `['user.view', 'admin.panel']`                               |
| `and`       | All permissions required         | `{ permissions: ['user.edit', 'user.delete'], mode: 'and' }` |
| `exact`     | Exact string match only          | `{ permissions: ['admin'], mode: 'exact' }`                  |
| `startWith` | Permission starts with pattern   | `{ permissions: ['admin.'], mode: 'startWith' }`             |
| `endWith`   | Permission ends with pattern     | `{ permissions: ['.view'], mode: 'endWith' }`                |
| `regex`     | Regular expression matching      | `{ permissions: ['^admin\\..*'], mode: 'regex' }`            |

### Mode Examples

```vue
<template>
  <!-- OR: User needs either permission -->
  <button v-permission="['user.create', 'admin.users']">Create</button>

  <!-- AND: User needs both permissions -->
  <button
    v-permission="{ permissions: ['user.edit', 'user.delete'], mode: 'and' }"
  >
    Full Edit Access
  </button>

  <!-- REGEX: Any admin permission -->
  <div v-permission="{ permissions: ['^admin\\.'], mode: 'regex' }">
    Admin Section
  </div>

  <!-- START WITH: Any menu permission -->
  <nav v-permission="{ permissions: ['menu.'], mode: 'startWith' }">
    Menu Items
  </nav>
</template>
```

---

## 🛠️ API Reference

### Plugin Options

```ts
interface PluginOptions {
  permissions?: string[] | Ref<string[]>;
  developmentMode?: boolean;
}
```

### Permission Value Types

```ts
type PermissionValue =
  | string // Single permission
  | string[] // Multiple permissions (OR)
  | PermissionObject; // Complex permission object

interface PermissionObject {
  permissions: string[];
  mode: "and" | "or" | "startWith" | "endWith" | "exact" | "regex";
}
```

### Utility Functions

```ts
// Configure permissions
configurePermissionDirective(permissions: string[] | Ref<string[]>, options?: { developmentMode?: boolean })

// Check permissions programmatically
hasPermission(permission: PermissionValue): Promise<boolean>

// Initialize from storage
initPermissionDirectiveIfNeeded(): void

// Clear cache
clearPermissionCache(): void

// Get current permissions
getCurrentPermissions(): string[]
```

---

## 🔍 Advanced Examples

### Dynamic Role-Based Menu

```vue
<template>
  <nav class="sidebar">
    <router-link
      v-permission="'dashboard.view'"
      to="/dashboard"
      class="nav-item"
    >
      Dashboard
    </router-link>

    <router-link
      v-permission="['users.view', 'admin.users']"
      to="/users"
      class="nav-item"
    >
      Users
    </router-link>

    <div
      v-permission="{ permissions: ['^admin\\.'], mode: 'regex' }"
      class="admin-section"
    >
      <h3>Admin</h3>
      <router-link v-permission="'admin.settings'" to="/admin/settings"
        >Settings</router-link
      >
      <router-link v-permission="'admin.reports'" to="/admin/reports"
        >Reports</router-link
      >
    </div>
  </nav>
</template>
```

### Conditional Form Fields

```vue
<template>
  <form @submit="handleSubmit">
    <input v-model="user.name" placeholder="Name" />
    <input v-model="user.email" placeholder="Email" />

    <!-- Only admins can change roles -->
    <select v-permission:show="'admin.users'" v-model="user.role">
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>

    <!-- Different submit buttons based on permissions -->
    <button v-permission="'user.create'" type="submit">Create User</button>

    <button
      v-permission="{ permissions: ['user.edit', 'admin.users'], mode: 'and' }"
      type="submit"
    >
      Advanced Save
    </button>
  </form>
</template>
```

---

## 🐛 Debugging

### Development Mode

```ts
app.use(PermissionPlugin, {
  permissions: userPermissions,
  developmentMode: true, // Enables console warnings and logs
});
```

### Common Issues

1. **Permissions not updating**: Clear cache after permission changes

```ts
clearPermissionCache();
configurePermissionDirective(newPermissions);
```

2. **Route guard not working**: Ensure `getAuthState` returns correct values

```ts
getAuthState: () => ({
  isAuthenticated: !!localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "{}"),
});
```

3. **Directive not reactive**: Use `Ref<string[]>` for reactive permissions

```ts
const permissions = ref(["user.view"]);
configurePermissionDirective(permissions);
```

---

## 📂 Project Structure

```
vue-permission/
├── src/
│   ├── directives/
│   │   └── v-permission.ts      # Directive implementation
│   ├── guards/
│   │   └── globalGuard.ts       # Route guard logic
│   ├── utils/
│   │   ├── permissionCache.ts   # Caching system
│   │   ├── permissionStorage.ts # LocalStorage encryption
│   │   └── permissionHelpers.ts # Core permission logic
│   ├── plugin.ts                # Vue plugin registration
│   ├── index.ts                 # Main exports
│   └── types.ts                 # TypeScript definitions
├── package.json
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © kerolos

---

## 🆕 Changelog

### v1.0.0

- Initial release
- `v-permission` directive
- Route guard implementation
- Permission caching
- Encrypted storage
- TypeScript support
