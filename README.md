# Agora CRM – Gestion simplifiée des associations

Agora CRM est une application web moderne développée avec Vue.js 3 et Supabase.
Elle offre une solution intuitive pour les associations souhaitant gérer leurs adhérents, cotisations, événements et leur communication interne.
L’application intègre également une section d’actualités provenant de grandes ONG (WWF, UNICEF, MSF...) grâce à l’API publique de The Guardian.

## Fonctionnalités principales
### Gestion complète des adhérents

Inscription, connexion et rôles personnalisés (adhérent, association, administrateur).

Modification du profil avec upload d’image (via Supabase Storage).

Attribution de rôles (président, trésorier, secrétaire, etc.) et de statuts (actif, en attente, suspendu).

### Suivi des cotisations

Liste des cotisations par année et par association.

Suivi du statut de paiement (payée / en attente) avec barre de progression.

Simulation de paiement et mise à jour en base Supabase.

### Gestion des événements

Création et affichage des événements associatifs.

Inscription / désinscription des adhérents.

Filtrage par statut et par association.

### Actualités associatives

Intégration de l’API The Guardian Open Platform.

Affichage des articles récents concernant les organisations humanitaires.

Gestion du loading, des erreurs et des états vides.

### Tableau de bord intelligent

Dashboards dynamiques selon le rôle (Adhérent / Association / Admin).

Statistiques en temps réel (nombre d’associations, adhérents, événements, cotisations payées).

Graphiques SVG simples et responsives.

## Architecture moderne

Vue.js 3 + Vite

Supabase (Auth, Database, Storage, API REST)

State management réactif (store global avec useGlobal.js)

Props et composants réutilisables (StatsCard, GlobalLoader, Navbar, Footer, etc.)

API externe pour démontrer l’intégration REST et la gestion d’états asynchrones.

## Technologies utilisées
Domaine	Technologie
Frontend	Vue.js 3 (Composition API)
Outil de build	Vite
Backend & Auth	Supabase
Base de données	PostgreSQL (hébergée par Supabase)
API externe	The Guardian Open Platform
Design	Tailwind CSS + CSS personnalisé
Hébergement	Vercel
Gestion d’état	Store global réactif (Vue reactivity + composables)

## Configuration du projet
### 1️) Créer un fichier .env.local

À la racine du projet (au même niveau que package.json), ajoutez :

VITE_SUPABASE_URL=votre_lien_API
VITE_SUPABASE_ANON_KEY=votre_clé

VITE_GUARDIAN_API_KEY=votre_clé


Ces clés permettent la connexion à la base Supabase et à l’API The Guardian.
Vous pouvez les remplacer par vos propres clés si nécessaire.

### 2️) Installer les dépendances
npm install

### 3️) Lancer le projet en local
npm run dev


L’application sera ensuite disponible à l’adresse affichée dans le terminal (ex: http://localhost:5173).

### 4️) (Optionnel) Déploiement sur Vercel

Sur Vercel, ajoutez vos variables d’environnement dans la section Project Settings → Environment Variables :
(notre projet est actuellement en ligne)

Nom	Valeur
VITE_SUPABASE_URL	(URL Supabase)
VITE_SUPABASE_ANON_KEY	(clé anonyme Supabase)
VITE_GUARDIAN_API_KEY	(clé API The Guardian)

Base de données Supabase
Tables principales :

profiles → informations des utilisateurs (nom, email, rôle, photo)

associations → données des associations (nom, code d’invitation, description, owner)

adherents_associations → lien entre adhérents et associations

evenements → événements créés par les associations

cotisations → suivi des paiements

notifications → messages internes et rappels automatiques

RLS activé avec politiques de sécurité selon le rôle (admin, association, adhérent).

Concepts clés mis en œuvre
Gestion des états et des props

Utilisation du store global pour centraliser user et loading.

Communication par props / events entre Navbar, Footer, Dashboard, etc.

- API externe (REST)

Requête asynchrone vers The Guardian API pour récupérer les actualités.

Gestion des états loading, error, et empty avec affichage conditionnel.

- Intégration Supabase

Authentification complète (login, signup, logout).

CRUD dynamique sur toutes les entités (adhérents, associations, événements, cotisations).

Stockage d’images via Supabase Storage.

- Réactivité et UI

Design responsive avec Tailwind CSS.

Composants dynamiques (StatsCard, GlobalLoader, ProfileCard).

Transitions légères et interface cohérente.

## Équipe de développement

Projet réalisé dans le cadre du module Interface Design & Development à EFREI Paris.

Développé par :

- Enzo Guignabert

- Iliès Boukhamssa

- Yuhao Huang
