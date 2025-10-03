<template>
  <header class="navbar">
    <div class="nav-container">
      <!-- Logo cliquable -->
      <div class="nav-left">
        <img 
          src="../assets/logo/logo_complet.png" 
          alt="Logo" 
          height="30" 
          class="logo" 
          @click="goHome" 
        />
      </div>

      <!-- Bouton hamburger (mobile) -->
      <button class="hamburger" @click="isOpen = !isOpen">☰</button>

      <!-- Liens au centre -->
      <nav :class="['nav-links', { open: isOpen }]">
        <!-- Invité (guest) -->
        <router-link v-if="user.role === 'guest'" to="/">Accueil</router-link>

        <!-- Admin -->
        <template v-if="user.role === 'admin'">
          <router-link to="/dashboard">Dashboard</router-link>
          <router-link to="/adherents">Adhérents</router-link>
          <router-link to="/cotisations">Cotisations</router-link>
          <router-link to="/evenements">Événements</router-link>
        </template>

        <!-- Association -->
        <template v-if="user.role === 'association'">
          <router-link to="/dashboard">Dashboard</router-link>
          <router-link to="/adherents">Adhérents</router-link>
          <router-link to="/evenements">Événements</router-link>
        </template>

        <!-- Adhérent -->
        <template v-if="user.role === 'adherent'">
          <router-link to="/cotisations">Mes cotisations</router-link>
          <router-link to="/evenements">Événements</router-link>
        </template>
      </nav>

      <!-- Bouton à droite -->
      <!-- Bouton à droite -->
        <div class="nav-right">
        <button v-if="!user.isLoggedIn" @click="goLogin">
            Connexion
        </button>
        <button v-else @click="$emit('toggle-auth')">
            Déconnexion
        </button>
        </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "Navbar",
  props: {
    user: Object
  },
  data() {
    return {
      isOpen: false
    }
  },
  methods: {
    goHome() {
        this.$router.push("/") // retour accueil
    },
    goLogin() {
        this.$router.push("/login") // envoie vers /login
    }
}
}
</script>

<style>
/* --- Styles de la navbar --- */
.navbar {
  background: #2563EB;
  color: white;
  padding: 0.8rem 1.5rem;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  cursor: pointer;
}

/* Hamburger (mobile) */
.hamburger {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  display: none;
  cursor: pointer;
}

/* Liens au centre */
.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  flex: 1;
}

/* Style des liens */
.nav-links a {
  text-decoration: none;
  color: white;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #dbeafe; /* bleu clair au hover */
}

/* On supprime le soulignement actif */
.nav-links a.router-link-exact-active {
  text-decoration: none;
  font-weight: 600;
}

/* Bouton à droite */
.nav-right button {
  background: white;
  color: #2563EB;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.nav-right button:hover {
  background: #f3f4f6;
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    background: #1d4ed8;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    padding: 1rem;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links a {
    margin: 0.5rem 0;
  }

  .nav-right {
    display: none; /* en mobile, tu pourrais mettre Connexion dans le menu */
  }

  .nav-links button {
    margin-top: 1rem;
  }
}
</style>