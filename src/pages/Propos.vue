<template>
  <div class="about">
    <!-- Section intro -->
    <section class="intro">
      <h1>À propos d’<span>Agora CRM</span></h1>
      <p>
        Agora CRM est né d’un besoin réel : simplifier la gestion des associations étudiantes
        et sportives. Fini les tableurs et les messages perdus ! 
        Agora centralise les adhérents, les cotisations et les événements au même endroit.
      </p>
    </section>

    <!-- Section problème -->
    <section class="problem">
      <h2>Problématique</h2>
      <p>
        Comment aider les associations à mieux gérer leurs membres, leurs cotisations et leurs événements, 
        tout en améliorant la communication et le suivi administratif ?
      </p>
    </section>

    <!-- Section objectifs -->
    <section class="goals">
      <h2>Nos objectifs</h2>
      <ul>
        <li>Centraliser les informations des adhérents et des associations.</li>
        <li>Automatiser la gestion des cotisations et des rappels de paiement.</li>
        <li>Simplifier la création et le suivi d’événements.</li>
        <li>Améliorer la communication entre associations et membres.</li>
        <li>Fournir un tableau de bord clair et intuitif.</li>
      </ul>
    </section>

    <!-- Section créateurs -->
    <section class="team">
      <h2>Les créateurs</h2>
      <div class="team-grid">
        <div class="team-card">
          <h3>Ilies Boukhamsa</h3>
          <p>Base de données & intégration backend</p>
        </div>
        <div class="team-card">
          <h3>Enzo Guignabert</h3>
          <p>Développement frontend & intégration Supabase</p>
        </div>
        <div class="team-card">
          <h3>Yuhao Huang</h3>
          <p>Design UI/UX & structure applicative</p>
        </div>
      </div>
    </section>

    <!-- Section contact -->
    <section class="contact">
      <h2>Nous contacter</h2>
      <p>
        Une question ou un besoin d’assistance ?  
        Contactez le support de <strong>Agora CRM</strong> :
      </p>
      <a href="mailto:support@agora-crm.com" class="btn-primary">Contacter le support</a>
      <p class="faq">
        Vous pouvez aussi consulter notre 
        <router-link to="/faq" class="link">FAQ</router-link>
        pour obtenir des réponses rapides.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: "About"
}
</script>

<style scoped>
/* Intro */
.intro {
  text-align: center;
  padding: 4rem 2rem;
  background: #f9fafb;
}
.intro h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1e3a8a;
}
.intro h1 span {
  color: #2563eb;
}
.intro p {
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
  color: #374151;
}

/* Sections */
section {
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}
section:nth-child(even) {
  background: #f9fafb;
}
h2 {
  color: #1e40af;
  font-size: 1.8rem;
  margin-bottom: 1.2rem;
}
p, li {
  color: #374151;
  font-size: 1rem;
  line-height: 1.6;
}
ul {
  list-style: none;
  padding: 0;
  max-width: 600px;
  margin: 0 auto;
}
li {
  margin-bottom: .5rem;
}

/* Team */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
.team-card {
  background: #f9fafb;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.team-card h3 {
  color: #2563eb;
  margin-bottom: .3rem;
}

/* Contact */
.contact a.btn-primary {
  display: inline-block;
  margin: 1rem 0;
  padding: 0.8rem 1.5rem;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
}
.contact a.btn-primary:hover {
  background: #1d4ed8;
}
.contact .faq {
  font-size: 0.95rem;
}
.link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}
.link:hover {
  text-decoration: underline;
}

/* Footer */
.footer {
  text-align: center;
  padding: 1rem;
  background: #2563eb;
  color: white;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 720px) {
  .intro h1 {
    font-size: 2rem;
  }
  h2 {
    font-size: 1.5rem;
  }
}
</style>
