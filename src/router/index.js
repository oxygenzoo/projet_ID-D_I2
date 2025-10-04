import { createRouter, createWebHistory } from "vue-router"

// Pages publiques
import Home from "../pages/Home.vue"
import LoginRegister from "../pages/LoginRegister.vue"

// Pages adhérent
import DashboardAdherent from "../pages/adherent/Dashboard.vue"
import CotisationsAdherent from "../pages/adherent/Cotisations.vue"
import EvenementsAdherent from "../pages/adherent/Evenements.vue"

// Pages association
import DashboardAsso from "../pages/association/Dashboard.vue"
import AdherentsAsso from "../pages/association/Adherents.vue"
import EvenementsAsso from "../pages/association/Evenements.vue"

// Pages admin
import DashboardAdmin from "../pages/admin/Dashboard.vue"
import AdherentsAdmin from "../pages/admin/Adherents.vue"
import CotisationsAdmin from "../pages/admin/Cotisations.vue"
import EvenementsAdmin from "../pages/admin/Evenements.vue"

const routes = [
  // Routes publiques
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: LoginRegister },

  // Routes adhérent
  {
    path: "/adherent/dashboard",
    name: "AdherentDashboard",
    component: DashboardAdherent,
    meta: { requiresAuth: true, role: "adherent" }
  },
  {
    path: "/adherent/cotisations",
    name: "AdherentCotisations",
    component: CotisationsAdherent,
    meta: { requiresAuth: true, role: "adherent" }
  },
  {
    path: "/adherent/evenements",
    name: "AdherentEvenements",
    component: EvenementsAdherent,
    meta: { requiresAuth: true, role: "adherent" }
  },

  // Routes association
  {
    path: "/association/dashboard",
    name: "AssociationDashboard",
    component: DashboardAsso,
    meta: { requiresAuth: true, role: "association" }
  },
  {
    path: "/association/adherents",
    name: "AssociationAdherents",
    component: AdherentsAsso,
    meta: { requiresAuth: true, role: "association" }
  },
  {
    path: "/association/evenements",
    name: "AssociationEvenements",
    component: EvenementsAsso,
    meta: { requiresAuth: true, role: "association" }
  },

  // Routes admin
  {
    path: "/admin/dashboard",
    name: "AdminDashboard",
    component: DashboardAdmin,
    meta: { requiresAuth: true, role: "admin" }
  },
  {
    path: "/admin/adherents",
    name: "AdminAdherents",
    component: AdherentsAdmin,
    meta: { requiresAuth: true, role: "admin" }
  },
  {
    path: "/admin/cotisations",
    name: "AdminCotisations",
    component: CotisationsAdmin,
    meta: { requiresAuth: true, role: "admin" }
  },
  {
    path: "/admin/evenements",
    name: "AdminEvenements",
    component: EvenementsAdmin,
    meta: { requiresAuth: true, role: "admin" }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware : protéger routes selon rôle
router.beforeEach((to, from, next) => {
  // récupère utilisateur stocké (exemple depuis localStorage ou store global)
  const user = JSON.parse(localStorage.getItem("user"))

  if (to.meta.requiresAuth && !user) {
    next("/login") // pas connecté
  } else if (to.meta.role && user?.role !== to.meta.role) {
    next("/") // mauvais rôle → retour accueil
  } else {
    next()
  }
})

export default router
