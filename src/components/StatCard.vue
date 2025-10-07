<template>
  <div class="stat-card" :class="{ loading, error: !!error }">
    <!-- État : chargement -->
    <div v-if="loading" class="state">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <!-- État : erreur -->
    <div v-else-if="error" class="state error-state">
      <p>Erreur : {{ error }}</p>
    </div>

    <!-- État : vide -->
    <div v-else-if="value === null || value === undefined">
      <h3>{{ title }}</h3>
      <p class="empty">—</p>
      <p class="desc">{{ description }}</p>
    </div>

    <!-- État : normal -->
    <div v-else>
      <h3>{{ title }}</h3>
      <p class="val">{{ formattedValue }}</p>
      <p class="desc">{{ description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatCard",
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number, null], default: null },
    description: { type: String, default: "" },
    loading: { type: Boolean, default: false },
    error: { type: String, default: "" },
    format: { type: String, default: "auto" } // auto, percent, currency
  },
  computed: {
    formattedValue() {
      if (this.value === null || this.value === undefined) return "—";

      switch (this.format) {
        case "percent":
          return this.value + "%";
        case "currency":
          return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR"
          }).format(this.value);
        default:
          return this.value;
      }
    }
  }
};
</script>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  padding: 1.2rem 1rem;
  text-align: center;
  transition: all 0.2s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card.loading {
  opacity: 0.8;
}

.stat-card.error {
  border: 1px solid #ef4444;
}

.stat-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.4rem;
}

.val {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.3rem;
}

.desc {
  color: #6b7280;
  font-size: 0.9rem;
}

.empty {
  font-size: 1.4rem;
  color: #9ca3af;
  margin: 0.3rem 0;
}

/* État */
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  min-height: 100px;
}
.state.error-state {
  color: #dc2626;
}

/* Spinner */
.spinner {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
