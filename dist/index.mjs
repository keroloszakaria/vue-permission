import { isRef as S } from "vue";
const g = /* @__PURE__ */ new Map(), W = (s) => g.has(s) ? g.get(s) : null, E = (s, e) => g.set(s, e), F = () => g.clear(), M = "__v_permission__", J = (s) => btoa(JSON.stringify(s)), G = (s) => JSON.parse(atob(s)), K = (s) => {
  try {
    localStorage.setItem(M, J(s));
  } catch (e) {
    console.warn("[v-permission] Failed to save permissions to storage:", e);
  }
}, T = () => {
  try {
    const s = localStorage.getItem(M);
    return s ? G(s) : null;
  } catch (s) {
    return console.warn("[v-permission] Failed to read permissions from storage:", s), null;
  }
};
let q = { permissions: null }, _ = !1;
const N = (s, e) => {
  q.permissions = s, _ = (e == null ? void 0 : e.developmentMode) ?? !1, F(), K(s);
}, j = () => {
  const s = T();
  s && N(s);
}, x = () => {
  const { permissions: s } = q;
  return S(s) ? s.value : s ?? [];
}, d = async (s, e) => {
  const n = e ?? x(), m = JSON.stringify({ permissionValue: s, currentPermissions: n }), f = W(m);
  if (f !== null) return f;
  const c = await (async (t) => {
    var p;
    if (typeof t == "string") return n.includes(t);
    if (Array.isArray(t))
      return (await Promise.all(
        t.map((i) => d(i, n))
      )).some(Boolean);
    if (typeof t == "object" && t.permissions && t.mode) {
      const { permissions: i, mode: P } = t, l = {
        and: () => i.every((r) => n.includes(r)),
        or: () => i.some((r) => n.includes(r)),
        startWith: () => i.some(
          (r) => n.some((o) => o.startsWith(r))
        ),
        endWith: () => i.some(
          (r) => n.some((o) => o.endsWith(r))
        ),
        exact: () => i.some((r) => n.includes(r)),
        regex: () => i.some((r) => {
          try {
            const o = new RegExp(r);
            return n.some((v) => o.test(v));
          } catch (o) {
            return _ && console.warn("[v-permission] Invalid regex:", r, o), !1;
          }
        })
      };
      return ((p = l[P]) == null ? void 0 : p.call(l)) ?? !1;
    }
    return _ && console.warn("[v-permission] Invalid permission value:", t), !1;
  })(s);
  return E(m, c), c;
}, B = {
  async mounted(s, e) {
    const n = e.value;
    await d(n) || (s._vPermissionOriginalDisplay = s.style.display, s.style.display = "none");
  },
  async updated(s, e) {
    if (e.value !== e.oldValue) {
      const n = await d(e.value);
      s.style.display = n ? s._vPermissionOriginalDisplay || "" : "none";
    }
  },
  unmounted(s) {
    s._vPermissionOriginalDisplay = void 0;
  }
}, k = {
  install(s, e) {
    e != null && e.permissions ? N(e.permissions, {
      developmentMode: e.developmentMode
    }) : j(), s.directive("permission", B);
  }
};
async function z(s, e, n, m = {}) {
  var R, C;
  const {
    authRoutes: f = [],
    protectedRoutes: A = [],
    getAuthState: c,
    loginPath: t = "/login",
    homePath: p = "/"
  } = m, i = (c == null ? void 0 : c()) ?? { isAuthenticated: !1 }, { isAuthenticated: P } = i, l = (i == null ? void 0 : i.permissions) || ((R = i == null ? void 0 : i.user) == null ? void 0 : R.permissions) || [], r = f.some((a) => a.path === s.path), o = (C = s.meta) == null ? void 0 : C.requiresAuth, v = async () => {
    var h, u;
    if (!((h = s.meta) != null && h.checkPermission)) return !0;
    const a = (u = s.meta) == null ? void 0 : u.permissions;
    return !a || a === "*" ? !0 : await d(a, l);
  }, O = async (a, h = "") => {
    var u, b;
    for (const y of a) {
      const D = h + y.path, w = (u = y.meta) == null ? void 0 : u.permissions;
      if (!w || w === "*" || await d(w, l))
        return D;
      if ((b = y.children) != null && b.length) {
        const I = await O(y.children, D);
        if (I) return I;
      }
    }
    return null;
  };
  if (!P)
    return o ? n(t) : n();
  if (r) return n(p);
  if (!await v()) {
    const a = await O(A);
    return n(a || t);
  }
  n();
}
export {
  k as PermissionPlugin,
  F as clearPermissionCache,
  N as configurePermission,
  z as globalGuard,
  d as hasPermission,
  j as initPermissionDirectiveIfNeeded,
  B as vPermission
};
