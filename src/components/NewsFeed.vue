<template>
  <section class="card news">
    <h2>Actualités du moment</h2>

    <!-- Loading -->
    <div v-if="loading" class="state">
      <div class="spinner"></div>
      <p>Chargement des actualités...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="state error">
      <p>❌ Erreur lors du chargement : {{ error }}</p>
      <button class="btn" @click="fetchNews">Réessayer</button>
    </div>

    <!-- Vide -->
    <div v-else-if="!news.length" class="state empty">
      <p>Aucune actualité trouvée.</p>
    </div>

    <!-- Liste -->
    <ul v-else class="news-list">
      <li v-for="article in news" :key="article.id" class="news-item">
        <h3>{{ article.title }}</h3>
        <p>{{ article.body }}</p>
      </li>
    </ul>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'
import { globalActions } from '@/store/useGlobal.js'

export default {
  name: 'NewsFeed',
  setup() {
    const news = ref([])
    const loading = ref(false)
    const error = ref('')

    async function fetchNews() {
      try {
        loading.value = true
        error.value = ''
        globalActions.setLoading(true)

        const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
        if (!res.ok) throw new Error('Erreur HTTP ' + res.status)
        const data = await res.json()

        news.value = data
      } catch (e) {
        error.value = e.message || 'Erreur inconnue'
      } finally {
        loading.value = false
        globalActions.setLoading(false)
      }
    }

    onMounted(fetchNews)

    return { news, loading, error, fetchNews }
  }
}
</script>

<style scoped>
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

h2 {
  color: #1e3a8a;
  margin-bottom: 1rem;
}

.news-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.news-item {
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.news-item h3 {
  margin: 0 0 .4rem;
  color: #111827;
  font-size: 1.1rem;
}

.news-item p {
  color: #4b5563;
  margin: 0;
  font-size: .95rem;
}

/* === États === */
.state {
  text-align: center;
  padding: 2rem 0;
}
.state.error {
  color: #dc2626;
}
.state.empty {
  color: #6b7280;
}

/* === Spinner === */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === Button === */
.btn {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
}
.btn:hover {
  background: #1d4ed8;
}
</style>
