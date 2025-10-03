<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <h1>Bienvenue sur <span>Agora CRM</span></h1>
      <p>
        La solution moderne pour les <strong>associations</strong> qui veulent 
        gérer facilement leurs <strong>adhérents</strong>, leurs <strong>cotisations</strong> 
        et leurs <strong>événements</strong>.
      </p>
      <div class="hero-buttons">
        <button class="btn-primary">Découvrir Agora</button>
        <button class="btn-secondary">Se connecter</button>
      </div>
    </section>

    <!-- Fonctionnalités -->
    <section class="features">
      <h2>Ce que vous pouvez faire avec Agora</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h3>Gestion des adhérents</h3>
          <p>Ajoutez, modifiez et suivez vos membres simplement.</p>
        </div>
        <div class="feature-card">
          <h3>Suivi des cotisations</h3>
          <p>Visualisez qui a payé, gérez vos finances en toute clarté.</p>
        </div>
        <div class="feature-card">
          <h3>Organisation d’événements</h3>
          <p>Créez des événements et gérez les inscriptions de vos membres.</p>
        </div>
      </div>
    </section>

    <!-- Pourquoi -->
    <section class="why">
      <h2>Pourquoi choisir Agora ?</h2>
      <p>
        Fini les tableurs compliqués ! Agora centralise tout dans une interface simple, 
        intuitive et accessible depuis n’importe où. 
      </p>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2025 Agora CRM – Projet étudiant EFREI</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "Home"
}
</script>

<style>
/* Hero section */
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: #f9fafb;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1e3a8a;
}

.hero h1 span {
  color: #2563eb;
}

.hero p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 2rem;
  color: #374151;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: white;
  border: 2px solid #2563eb;
  color: #2563eb;
}

.btn-secondary:hover {
  background: #e0e7ff;
}

/* Features */
.features {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
}

.features h2 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #1e40af;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
}

.feature-card h3 {
  margin-bottom: 0.5rem;
  color: #2563eb;
}

/* Why section */
.why {
  text-align: center;
  padding: 3rem 2rem;
  background: #f3f4f6;
}

.why h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #1e40af;
}

.why p {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  color: #374151;
}

/* Footer */
.footer {
  text-align: center;
  padding: 1rem;
  background: #2563eb;
  color: white;
  margin-top: 2rem;
}
</style>
