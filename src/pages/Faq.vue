<template>
  <div class="faq-page">
    <!-- En-tête -->
    <header class="faq-header">
      <h1>Foire aux Questions</h1>
      <p>Retrouvez ici les réponses aux questions les plus fréquentes sur Agora CRM.</p>
    </header>

    <!-- Bloc de questions -->
    <section class="faq-list">
      <div
        v-for="(item, i) in faqs"
        :key="i"
        class="faq-item"
        @click="toggle(i)"
      >
        <div class="faq-question">
          <h3>{{ item.question }}</h3>
          <span class="icon" :class="{ open: item.open }">⌄</span>
        </div>
        <div v-if="item.open" class="faq-answer">
          <p>{{ item.answer }}</p>
        </div>
      </div>
    </section>

    <!-- Bas de page -->
    <section class="faq-contact">
      <h2>Vous n’avez pas trouvé votre réponse ?</h2>
      <p>
        Contactez notre équipe à 
        <a href="mailto:support@agora-crm.fr">support@agora-crm.fr</a> 
        ou visitez la page <router-link to="/support">Support Agora</router-link>.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: "Faq",
  data() {
    return {
      faqs: [
        {
          question: "Qu’est-ce qu’Agora CRM ?",
          answer:
            "Agora CRM est une plateforme de gestion pensée pour les associations. Elle centralise la gestion des adhérents, cotisations, événements et communications en un seul outil simple et moderne.",
          open: true
        },
        {
          question: "Comment créer une association sur Agora ?",
          answer:
            "Lors de votre inscription, choisissez le rôle 'Association'. Vous pourrez alors créer votre profil d’association, obtenir un code d’invitation et inviter vos adhérents à vous rejoindre.",
          open: false
        },
        {
          question: "Les adhérents peuvent-ils accéder à leurs cotisations ?",
          answer:
            "Oui, chaque adhérent possède un espace personnel où il peut consulter ses cotisations, événements à venir, notifications et informations associatives.",
          open: false
        },
        {
          question: "Puis-je envoyer des notifications à mes membres ?",
          answer:
            "Oui, Agora permet aux responsables d’association d’envoyer des rappels ou annonces à leurs adhérents directement depuis le tableau de bord.",
          open: false
        },
        {
          question: "Est-ce que mes données sont sécurisées ?",
          answer:
            "Tout à fait. Les données sont stockées sur Supabase, une infrastructure sécurisée et conforme aux normes modernes de confidentialité.",
          open: false
        },
        {
          question: "Comment contacter l’équipe Agora ?",
          answer:
            "Vous pouvez nous écrire à tout moment via l’adresse support@agora-crm.fr ou depuis la page Support du site.",
          open: false
        }
      ]
    };
  },
  methods: {
    toggle(i) {
      this.faqs[i].open = !this.faqs[i].open;
    }
  }
};
</script>

<style scoped>
.faq-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  color: #1f2937;
}

.faq-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.faq-header h1 {
  font-size: 2.2rem;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.faq-header p {
  color: #4b5563;
  font-size: 1.1rem;
}

/* Liste FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: #f9fafb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  cursor: pointer;
}

.faq-item:hover {
  background: #f3f4f6;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question h3 {
  font-size: 1.05rem;
  color: #111827;
  margin: 0;
}

.icon {
  font-size: 1.2rem;
  color: #2563eb;
  transition: transform 0.2s;
}

.icon.open {
  transform: rotate(180deg);
}

.faq-answer {
  margin-top: 0.75rem;
  color: #374151;
  line-height: 1.5;
}

/* Contact section */
.faq-contact {
  margin-top: 3rem;
  text-align: center;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.faq-contact h2 {
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.faq-contact p {
  color: #4b5563;
}

.faq-contact a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.faq-contact a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 720px) {
  .faq-header h1 {
    font-size: 1.8rem;
  }
  .faq-item {
    padding: 0.9rem 1rem;
  }
}
</style>
