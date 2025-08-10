import { isRef as S } from "vue";
const g = /* @__PURE__ */ new Map(), W = (e) => g.has(e) ? g.get(e) : null, E = (e, s) => g.set(e, s), F = () => g.clear(), M = "__v_permission__", J = (e) => btoa(JSON.stringify(e)), G = (e) => JSON.parse(atob(e)), K = (e) => {
  try {
    localStorage.setItem(M, J(e));
  } catch (s) {
    console.warn("[v-permission] Failed to save permissions to storage:", s);
  }
}, T = () => {
  try {
    const e = localStorage.getItem(M);
    return e ? G(e) : null;
  } catch (e) {
    return console.warn("[v-permission] Failed to read permissions from storage:", e), null;
  }
};
let q = { permissions: null }, _ = !1;
const N = (e, s) => {
  q.permissions = e, _ = (s == null ? void 0 : s.developmentMode) ?? !1, F(), K(e);
}, j = () => {
  const e = T();
  e && N(e);
}, x = () => {
  const { permissions: e } = q;
  return S(e) ? e.value : e ?? [];
}, d = async (e, s) => {
  const i = s ?? x(), m = JSON.stringify({ permissionValue: e, currentPermissions: i }), f = W(m);
  if (f !== null) return f;
  const c = await (async (t) => {
    var p;
    if (typeof t == "string") return i.includes(t);
    if (Array.isArray(t))
      return (await Promise.all(
        t.map((n) => d(n, i))
      )).some(Boolean);
    if (typeof t == "object" && t.permissions && t.mode) {
      const { permissions: n, mode: P } = t, l = {
        and: () => n.every((r) => i.includes(r)),
        or: () => n.some((r) => i.includes(r)),
        startWith: () => n.some(
          (r) => i.some((o) => o.startsWith(r))
        ),
        endWith: () => n.some(
          (r) => i.some((o) => o.endsWith(r))
        ),
        exact: () => n.some((r) => i.includes(r)),
        regex: () => n.some((r) => {
          try {
            const o = new RegExp(r);
            return i.some((v) => o.test(v));
          } catch (o) {
            return _ && console.warn("[v-permission] Invalid regex:", r, o), !1;
          }
        })
      };
      return ((p = l[P]) == null ? void 0 : p.call(l)) ?? !1;
    }
    return _ && console.warn("[v-permission] Invalid permission value:", t), !1;
  })(e);
  return E(m, c), c;
}, B = {
  async mounted(e, s) {
    const i = s.value;
    await d(i) || (e._vPermissionOriginalDisplay = e.style.display, e.style.display = "none");
  },
  async updated(e, s) {
    if (s.value !== s.oldValue) {
      const i = await d(s.value);
      e.style.display = i ? e._vPermissionOriginalDisplay || "" : "none";
    }
  },
  unmounted(e) {
    e._vPermissionOriginalDisplay = void 0;
  }
}, k = {
  install(e, s) {
    s != null && s.permissions ? N(s.permissions, {
      developmentMode: s.developmentMode
    }) : j(), e.directive("permission", B);
  }
};
async function z(e, s, i, m = {}) {
  var R, C;
  const {
    authRoutes: f = [],
    protectedRoutes: A = [],
    getAuthState: c,
    loginPath: t = "/login",
    homePath: p = "/"
  } = m, n = (c == null ? void 0 : c()) ?? { isAuthenticated: !1 }, { isAuthenticated: P } = n, l = (n == null ? void 0 : n.permissions) || ((R = n == null ? void 0 : n.user) == null ? void 0 : R.permissions) || [], r = f.some((a) => a.path === e.path), o = (C = e.meta) == null ? void 0 : C.requiresAuth, v = async () => {
    var h, u;
    if (!((h = e.meta) != null && h.checkPermission)) return !0;
    const a = (u = e.meta) == null ? void 0 : u.permissions;
    return !a || a === "*" ? !0 : await d(a, l);
  }, O = async (a, h = "") => {
    var u, D;
    for (const y of a) {
      const b = h + y.path, w = (u = y.meta) == null ? void 0 : u.permissions;
      if (!w || w === "*" || await d(w, l))
        return b;
      if ((D = y.children) != null && D.length) {
        const I = await O(y.children, b);
        if (I) return I;
      }
    }
    return null;
  };
  if (!P)
    return o ? i(t) : i();
  if (r) return i(p);
  if (!await v()) {
    const a = await O(A);
    return i(a || t);
  }
  i();
}
export {
  k as PermissionPlugin,
  F as clearPermissionCache,
  N as configurePermissionDirective,
  z as globalGuard,
  d as hasPermission,
  j as initPermissionDirectiveIfNeeded,
  B as vPermission
};
