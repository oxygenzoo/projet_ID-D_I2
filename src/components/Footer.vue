<template>
  <footer class="footer">
    <div class="footer-inner">
      <!-- Colonne 1 -->
      <div class="footer-brand">
        <h3>Agora CRM</h3>
        <p class="muted">
          La solution simple et moderne pour gérer vos associations, adhérents,
          cotisations et événements — tout en un seul endroit.
        </p>
      </div>

      <!-- Colonne 2 -->
      <div class="footer-links">
        <h4>Navigation</h4>
        <ul>
          <li><router-link to="/">Accueil</router-link></li>
          <li><router-link to="/propos">À propos</router-link></li>
          <li><router-link to="/faq">FAQ</router-link></li>
          <li><router-link to="/support">Support</router-link></li>
        </ul>
      </div>

      <!-- Colonne 3 -->
      <div class="footer-contact">
        <h4>Contact</h4>
        <p>Email : <a href="mailto:support@agora-crm.fr">support@agora-crm.fr</a></p>
        <p>Téléphone : +33 1 00 00 00 00</p>
        <p>Projet étudiant EFREI Paris</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 Agora CRM — Tous droits réservés.</p>
      <p class="muted">Développé par Ilies Boukhamsa, Enzo Guignabert & Yuhao Huang</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  background: #1e3a8a; /* bleu foncé comme la navbar */
  color: #fff;
  padding: 3rem 2rem 1.5rem;
  margin-top: 3rem;
  border-top: 4px solid #2563eb;
}

.footer-inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer h3 {
  font-size: 1.4rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.footer h4 {
  font-size: 1.1rem;
  color: #dbeafe;
  margin-bottom: 0.5rem;
}

.footer p {
  color: #d1d5db;
  line-height: 1.5;
  margin: 0.25rem 0;
}

.footer a {
  color: #bfdbfe;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer a:hover {
  color: #fff;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin: 0.3rem 0;
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.muted {
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 720px) {
  .footer {
    padding: 2rem 1rem;
  }
  .footer-bottom {
    font-size: 0.85rem;
  }
}
</style>
