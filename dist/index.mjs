import { isRef as N } from "vue";
const P = /* @__PURE__ */ new Map(), W = (e) => P.has(e) ? P.get(e) : null, E = (e, s) => P.set(e, s), F = () => P.clear(), D = "__v_permission__", J = (e) => btoa(JSON.stringify(e)), G = (e) => JSON.parse(atob(e)), K = (e) => {
  try {
    localStorage.setItem(D, J(e));
  } catch (s) {
    console.warn("[v-permission] Failed to save permissions to storage:", s);
  }
}, T = () => {
  try {
    const e = localStorage.getItem(D);
    return e ? G(e) : null;
  } catch (e) {
    return console.warn("[v-permission] Failed to read permissions from storage:", e), null;
  }
};
let I = { permissions: null }, _ = !1;
const M = (e, s) => {
  I.permissions = e, _ = (s == null ? void 0 : s.developmentMode) ?? !1, F(), K(e);
}, j = () => {
  const e = T();
  e && M(e);
}, q = () => {
  const { permissions: e } = I;
  return N(e) ? e.value : e ?? [];
}, f = async (e, s) => {
  const t = s ?? q(), m = JSON.stringify({ permissionValue: e, currentPermissions: t }), h = W(m);
  if (h !== null) return h;
  const c = await (async (r) => {
    var p;
    if (typeof r == "string")
      return t.includes(r);
    if (Array.isArray(r))
      return (await Promise.all(
        r.map((u) => f(u, t))
      )).some(Boolean);
    if (typeof r == "object" && r.permissions && r.mode) {
      const { permissions: i, mode: u } = r, l = {
        and: () => i.every((n) => t.includes(n)),
        or: () => i.some((n) => t.includes(n)),
        startWith: () => i.some(
          (n) => t.some((o) => o.startsWith(n))
        ),
        endWith: () => i.some(
          (n) => t.some((o) => o.endsWith(n))
        ),
        exact: () => i.some((n) => t.includes(n)),
        regex: () => i.some((n) => {
          try {
            const o = new RegExp(n);
            return t.some((v) => o.test(v));
          } catch (o) {
            return _ && console.warn("[v-permission] Invalid regex:", n, o), !1;
          }
        })
      };
      return ((p = l[u]) == null ? void 0 : p.call(l)) ?? !1;
    }
    return _ && console.warn("[v-permission] Invalid permission value:", r), !1;
  })(e);
  return E(m, c), c;
}, x = {
  async mounted(e, s) {
    const t = s.value;
    await f(t) || (e._vPermissionOriginalDisplay = e.style.display, e.style.display = "none");
  },
  async updated(e, s) {
    if (s.value !== s.oldValue) {
      const t = await f(s.value);
      e.style.display = t ? e._vPermissionOriginalDisplay || "" : "none";
    }
  },
  unmounted(e) {
    e._vPermissionOriginalDisplay = void 0;
  }
}, Y = {
  install(e, s) {
    s != null && s.permissions ? M(s.permissions, {
      developmentMode: s.developmentMode
    }) : j(), e.directive("permission", x);
  }
};
async function k(e, s, t, m = {}) {
  var O;
  const {
    authRoutes: h = [],
    protectedRoutes: A = [],
    getAuthState: c,
    loginPath: r = "/login",
    homePath: p = "/"
  } = m, i = (c == null ? void 0 : c()) ?? { isAuthenticated: !1 }, { isAuthenticated: u } = i, l = q(), n = h.some((a) => a.path === e.path), o = (O = e.meta) == null ? void 0 : O.requiresAuth, v = async () => {
    var y, d;
    if (!((y = e.meta) != null && y.checkPermission)) return !0;
    const a = (d = e.meta) == null ? void 0 : d.permissions;
    return !a || a === "*" ? !0 : await f(a, l);
  }, S = async (a, y = "") => {
    var d, R;
    for (const g of a) {
      const C = y + g.path, w = (d = g.meta) == null ? void 0 : d.permissions;
      if (!w || w === "*" || await f(w, l))
        return C;
      if ((R = g.children) != null && R.length) {
        const b = await S(g.children, C);
        if (b) return b;
      }
    }
    return null;
  };
  if (!u)
    return o ? t(r) : t();
  if (n) return t(p);
  if (!await v()) {
    const a = await S(A);
    return t(a || r);
  }
  t();
}
export {
  Y as PermissionPlugin,
  F as clearPermissionCache,
  M as configurePermission,
  k as globalGuard,
  f as hasPermission,
  j as initPermissionDirectiveIfNeeded,
  x as vPermission
};
