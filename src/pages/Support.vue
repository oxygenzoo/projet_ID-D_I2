<template>
  <div class="support-page">
    <!-- En-tête -->
    <header class="support-header">
      <h1>Contacter le support Agora</h1>
      <p>
        Une question, un bug ou un retour à nous faire ?  
        L’équipe Agora CRM est là pour vous aider.
      </p>
    </header>

    <!-- Contenu -->
    <div class="support-content">
      <!-- Formulaire -->
      <section class="support-form card">
        <h2>Envoyer un message</h2>
        <form @submit.prevent="submitForm">
          <label>
            <span>Nom complet</span>
            <input v-model="form.name" type="text" required placeholder="Votre nom" />
          </label>

          <label>
            <span>Email</span>
            <input v-model="form.email" type="email" required placeholder="votreadresse@email.fr" />
          </label>

          <label>
            <span>Sujet</span>
            <select v-model="form.subject" required>
              <option value="">Sélectionner un sujet</option>
              <option value="question">Question générale</option>
              <option value="bug">Problème technique</option>
              <option value="compte">Problème de compte</option>
              <option value="autre">Autre demande</option>
            </select>
          </label>

          <label>
            <span>Message</span>
            <textarea
              v-model="form.message"
              rows="5"
              placeholder="Décrivez votre demande avec le plus de détails possible..."
              required
            ></textarea>
          </label>

          <div class="form-actions">
            <button type="submit" class="btn">Envoyer</button>
          </div>
        </form>

        <div v-if="submitted" class="success">
          <p>✅ Merci ! Votre message a bien été envoyé. Nous reviendrons vers vous sous peu.</p>
        </div>
      </section>

      <!-- Bloc d'infos -->
      <aside class="support-info card">
        <h2>Autres moyens de contact</h2>
        <p>Email : <a href="mailto:support@agora-crm.fr">support@agora-crm.fr</a></p>
        <p>Téléphone : +33 1 00 00 00 00</p>
        <p>Horaires : Lundi - Vendredi, 9h à 18h</p>

        <router-link class="btn outline" to="/faq">Consulter la FAQ</router-link>
      </aside>
    </div>
  </div>
</template>

<script>
export default {
  name: "Support",
  data() {
    return {
      form: {
        name: "",
        email: "",
        subject: "",
        message: ""
      },
      submitted: false
    };
  },
  methods: {
    submitForm() {
      // ici tu pourrais connecter Supabase ou EmailJS plus tard
      console.log("Message envoyé :", this.form);
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
        this.form = { name: "", email: "", subject: "", message: "" };
      }, 4000);
    }
  }
};
</script>

<style scoped>
.support-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  color: #1f2937;
}

.support-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.support-header h1 {
  font-size: 2.2rem;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.support-header p {
  color: #4b5563;
  font-size: 1.1rem;
}

.support-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Formulaire */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 1.8rem;
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
}

.support-form h2,
.support-info h2 {
  font-size: 1.3rem;
  color: #1e3a8a;
  margin-bottom: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

label span {
  font-weight: 600;
  color: #374151;
}

input,
select,
textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

textarea {
  resize: vertical;
}

.form-actions {
  text-align: right;
  margin-top: 1rem;
}

.btn {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn:hover {
  background: #1e40af;
}

.btn.outline {
  background: transparent;
  color: #2563eb;
  border: 2px solid #2563eb;
  display: inline-block;
  margin-top: 1rem;
  text-align: center;
}

.btn.outline:hover {
  background: #eff6ff;
}

.success {
  margin-top: 1rem;
  padding: 1rem;
  background: #ecfdf5;
  color: #065f46;
  border-radius: 8px;
  font-weight: 500;
}

/* Bloc infos */
.support-info p {
  margin-bottom: 0.75rem;
  color: #374151;
}

.support-info a {
  color: #2563eb;
  text-decoration: none;
}

.support-info a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 900px) {
  .support-content {
    grid-template-columns: 1fr;
  }
}
</style>
