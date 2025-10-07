import { createRouter, createWebHistory } from "vue-router"
import { supabase } from "../lib/supabase"

// Pages publiques
import Home from "../pages/Home.vue"
import LoginRegister from "../pages/LoginRegister.vue"
import Propos from "../pages/Propos.vue"
import Faq from "../pages/Faq.vue"
import Support from "../pages/Support.vue"

// Pages adhérent
import DashboardAdherent from "../pages/adherent/Dashboard.vue"
import CotisationsAdherent from "../pages/adherent/Cotisations.vue"
import EvenementsAdherent from "../pages/adherent/Evenements.vue"

// Pages association
import DashboardAsso from "../pages/association/Dashboard.vue"

// Pages admin
import DashboardAdmin from "../pages/admin/Dashboard.vue"
import AdherentsAdmin from "../pages/admin/Adherents.vue"
import AssociationAdmin from "../pages/admin/Association.vue"

const routes = [
  { path: "/propos", name: "Propos", component: Propos},
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: LoginRegister },
  { path: "/faq", name: "Faq", component: Faq },
  { path: "/support", name: "Support", component: Support},

  // Adhérent
  {
    path: "/adherent/dashboard",
    component: DashboardAdherent,
    meta: { requiresAuth: true, role: "adherent" },
  },
  {
    path: "/adherent/cotisations",
    component: CotisationsAdherent,
    meta: { requiresAuth: true, role: "adherent" },
  },
  {
    path: "/adherent/evenements",
    component: EvenementsAdherent,
    meta: { requiresAuth: true, role: "adherent" },
  },

  // Association
  {
    path: "/association/dashboard",
    component: DashboardAsso,
    meta: { requiresAuth: true, role: "association" },
  },

  // Admin
  {
    path: "/admin/dashboard",
    component: DashboardAdmin,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/adherents",
    component: AdherentsAdmin,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/association",
    component: AssociationAdmin,
    meta: { requiresAuth: true, role: "admin" },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ Middleware : protège les routes et synchronise le rôle
router.beforeEach(async (to, from, next) => {
  let user = JSON.parse(localStorage.getItem("user"))

  // Si pas d'utilisateur stocké → tentative de récupération via Supabase
  if (!user) {
    const { data } = await supabase.auth.getUser()
    const supaUser = data?.user

    if (supaUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, email")
        .eq("id", supaUser.id)
        .single()

      if (profile) {
        user = {
          id: supaUser.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role,
          isLoggedIn: true,
        }
        localStorage.setItem("user", JSON.stringify(user))
      }
    }
  }

  // Contrôle d'accès
  if (to.meta.requiresAuth && !user) {
    next("/login")
  } else if (to.meta.role && user?.role !== to.meta.role) {
    next("/")
  } else {
    next()
  }
})

export default router
