import { isRef as M } from "vue";
const y = /* @__PURE__ */ new Map(), N = (e) => y.has(e) ? y.get(e) : null, W = (e, s) => y.set(e, s), E = () => y.clear(), D = "__v_permission__", F = (e) => btoa(JSON.stringify(e)), J = (e) => JSON.parse(atob(e)), q = (e) => {
  try {
    localStorage.setItem(D, F(e));
  } catch (s) {
    console.warn("[v-permission] Failed to save permissions to storage:", s);
  }
}, G = () => {
  try {
    const e = localStorage.getItem(D);
    return e ? J(e) : null;
  } catch (e) {
    return console.warn("[v-permission] Failed to read permissions from storage:", e), null;
  }
};
let b = { permissions: null }, w = !1;
const I = (e, s) => {
  b.permissions = e, w = (s == null ? void 0 : s.developmentMode) ?? !1, E(), q(e);
}, K = () => {
  const e = G();
  e && I(e);
}, T = () => {
  const { permissions: e } = b;
  return M(e) ? e.value : e ?? [];
}, d = async (e) => {
  const s = T(), i = JSON.stringify(e), c = N(i);
  if (c !== null) return c;
  const f = await (async (n) => {
    var l;
    if (typeof n == "string") return s.includes(n);
    if (Array.isArray(n))
      return (await Promise.all(n.map(d))).some(Boolean);
    if (typeof n == "object" && n.permissions && n.mode) {
      const { permissions: a, mode: g } = n, m = {
        and: () => a.every((t) => s.includes(t)),
        or: () => a.some((t) => s.includes(t)),
        startWith: () => a.some(
          (t) => s.some((r) => r.startsWith(t))
        ),
        endWith: () => a.some(
          (t) => s.some((r) => r.endsWith(t))
        ),
        exact: () => a.some((t) => s.includes(t)),
        regex: () => a.some((t) => {
          try {
            const r = new RegExp(t);
            return s.some((v) => r.test(v));
          } catch (r) {
            return w && console.warn("[v-permission] Invalid regex:", t, r), !1;
          }
        })
      };
      return ((l = m[g]) == null ? void 0 : l.call(m)) ?? !1;
    }
    return w && console.warn("[v-permission] Invalid permission value:", n), !1;
  })(e);
  return W(i, f), f;
}, j = {
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
}, B = {
  install(e, s) {
    s != null && s.permissions ? I(s.permissions, {
      developmentMode: s.developmentMode
    }) : K(), e.directive("permission", j);
  }
};
async function Y(e, s, i, c = {}) {
  var S;
  const {
    authRoutes: _ = [],
    protectedRoutes: f = [],
    getAuthState: n,
    loginPath: l = "/login",
    homePath: a = "/"
  } = c, g = (n == null ? void 0 : n()) ?? { isAuthenticated: !1 }, { isAuthenticated: m } = g, t = _.some((o) => o.path === e.path), r = (S = e.meta) == null ? void 0 : S.requiresAuth, v = async () => {
    var p, u;
    if (!((p = e.meta) != null && p.checkPermission)) return !0;
    const o = (u = e.meta) == null ? void 0 : u.permissions;
    return !o || o === "*" ? !0 : await d(o);
  }, A = async (o, p = "") => {
    var u, O;
    for (const h of o) {
      const R = p + h.path, P = (u = h.meta) == null ? void 0 : u.permissions;
      if (!P || P === "*" || await d(P))
        return R;
      if ((O = h.children) != null && O.length) {
        const C = await A(h.children, R);
        if (C) return C;
      }
    }
    return null;
  };
  if (!m)
    return r ? i(l) : i();
  if (t) return i(a);
  if (!await v()) {
    const o = await A(f);
    return i(o || l);
  }
  i();
}
export {
  B as PermissionPlugin,
  E as clearPermissionCache,
  I as configurePermissionDirective,
  Y as globalGuard,
  d as hasPermission,
  K as initPermissionDirectiveIfNeeded,
  j as vPermission
};
