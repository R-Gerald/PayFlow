# PayFlow

Application web pour gérer les crédits clients d’un commerçant (petits commerces, boutiques, etc.).

Ce repo contient :

- un **backend** Spring Boot + PostgreSQL (API REST sécurisée par JWT),
- un **frontend** React (Vite, Tailwind, shadcn/ui) intégrant l’authentification.

> Version actuelle : **v1 avec login / inscription JWT pour les merchants**.

---

## 1. Fonctionnalités

### Frontend

- **Authentification**
  - Page **Login** (`/login`)
    - Connexion avec téléphone + mot de passe.
    - Récupère un JWT depuis le backend et le stocke dans `localStorage`.
  - Page **Inscription** (`/register`)
    - Création de compte merchant : nom, téléphone, email (optionnel), mot de passe.
    - En cas de succès, connexion automatique (token stocké) et redirection vers l’accueil.
  - Protection des routes :
    - Si aucun token (`payflow_token`), toute tentative d’accès à `/`, `/clients`, `/statistics`, etc. redirige vers `/login`.
    - Si un token valide existe, on accède directement à la Home.

- **Layout**
  - Bouton **Déconnexion** en haut à droite :
    - Efface le token et les infos merchant (`payflow_token`, `payflow_merchant_id`, `payflow_merchant_name`) du `localStorage`.
    - Redirige vers `/login`.
  - Affiche le **nom du merchant connecté** à côté du bouton de déconnexion.
  - Barre de navigation en bas : Accueil, Clients, Stats.

- **Pages métier**
  - **Home** :
    - Affiche les statistiques globales :
      - total dû (somme des soldes clients > 0),
      - montants récupérés (sommes des paiements),
      - nombre de clients avec crédit.
    - Recherche de clients.
    - Liste des clients avec leur solde dû et badge “Retard” si dettes en retard.
  - **Clients** :
    - Liste de tous les clients du merchant connecté.
    - Recherche + filtres (tous, avec crédit, en retard).
    - Accès au détail d’un client.
  - **Détail client** :
    - Affiche le solde dû d’un client.
    - Affiche l’historique de ses transactions (dettes/paiements).
    - Permet d’ajouter une dette.
    - Permet d’ajouter un paiement.
  - **Stats** :
    - Vue d’ensemble des crédits/paiements.
    - Graphiques (recharts) et statistiques agrégées.

---

## 2. Backend

### 2.1 Modèle de données (PostgreSQL)

Schéma `payflow` :

- `merchants`
  - `id` (BIGSERIAL, PK)
  - `name`
  - `phone` (unique, sert de login)
  - `email` (optionnel, unique)
  - `password_hash`
  - `created_at`, `updated_at`

- `customers`
  - `id`
  - `merchant_id` (FK → merchants.id, `ON DELETE CASCADE`)
  - `name`
  - `phone` (optionnel, unique par merchant)
  - `notes`
  - `created_at`, `updated_at`

- `transactions`
  - `id`
  - `merchant_id` (FK → merchants.id)
  - `customer_id` (FK → customers.id)
  - `type` (`CREDIT` ou `PAYMENT`)
  - `amount`
  - `description`
  - `transaction_date`
  - `due_date`
  - `payment_method`
  - `created_at`, `updated_at`

Des **triggers** mettent à jour automatiquement `updated_at`.  
Des requêtes JPQL calculent :

- le **solde dû par client** (total des crédits – total des paiements),
- les **totaux globaux** (crédits/paiements) pour les stats.

### 2.2 Authentification JWT

- **Endpoints d’auth** (`/api/auth`)

  - `POST /api/auth/register`  
    Request body :
    ```json
    {
      "name": "Boutik Anjara",
      "phone": "0341234567",
      "email": "merchant@example.com",
      "password": "secret123"
    }
    ```
    Response :
    ```json
    {
      "merchantId": 1,
      "name": "Boutik Anjara",
      "phone": "0341234567",
      "token": "eyJhbGciOiJIUzI1NiJ9..."
    }
    ```

  - `POST /api/auth/login`  
    Request body :
    ```json
    {
      "phone": "0341234567",
      "password": "secret123"
    }
    ```
    Response identique à `register` (avec un nouveau token).

- **JwtService**
  - Génère un token JWT signé (HS256) contenant :
    - `sub` = `merchantId`
    - `phone` = téléphone du merchant
    - `iat`, `exp` (24h).

- **JwtAuthenticationFilter**
  - Lit le header `Authorization: Bearer <token>`.
  - Valide le token via `JwtService`.
  - Charge le `Merchant` correspondant et met un `Authentication` dans le `SecurityContext`.

- **SecurityConfig**
  - Désactive CSRF pour l’API.
  - Active CORS sur `/api/**` pour `http://localhost:5173`.
  - Définit les règles :
    - `/api/auth/register` et `/api/auth/login` sont publics.
    - tous les autres `/api/**` nécessitent un JWT valide.
  - Session stateless (`SessionCreationPolicy.STATELESS`).

### 2.3 Endpoints métier

- **Pour le merchant authentifié (via JWT)** :

  - `GET /api/me/customers`  
    Renvoie la liste des clients du merchant connecté avec, pour chacun :
    ```json
    {
      "id": 1,
      "name": "Client 1",
      "phone": "033...",
      "notes": "Premier client",
      "totalDue": 10000.00
    }
    ```

  - `POST /api/me/customers`  
    Crée un nouveau client pour le merchant connecté.

  - `GET /api/me/transactions`  
    Renvoie toutes les transactions (CREDIT/PAYMENT) du merchant connecté.

  - `POST /api/me/transactions`  
    Crée une transaction (dette ou paiement) pour un client du merchant connecté.

---

## 3. Frontend

### 3.1 Stack

- React + Vite
- Tailwind CSS + shadcn/ui
- React Router (`react-router-dom`)
- React Query (`@tanstack/react-query`)
- Axios pour les appels HTTP
- Recharts pour les graphiques

### 3.2 Intégration API

- `src/api/base44Client.js` :
  - Configure un axios instance avec `baseURL: http://localhost:8080/api`.
  - Interceptor `request` :
    - lit `payflow_token` dans `localStorage`,
    - ajoute `Authorization: Bearer <token>` si présent.
  - Expose :
    - `base44.entities.Client.list()` → `GET /me/customers`
    - `base44.entities.Client.create(data)` → `POST /me/customers`
    - `base44.entities.Transaction.list()` → `GET /me/transactions`
    - `base44.entities.Transaction.create(data)` → `POST /me/transactions`

---

## 4. Structure du projet

```text
PayFlow/
├─ backend/
│  ├─ src/main/java/com/project/payflow/
│  │  ├─ PayFlowApplication.java
│  │  ├─ entities/             # Merchant, Customer, Transaction, TransactionType
│  │  ├─ repository/           # MerchantRepository, CustomerRepository, TransactionRepository
│  │  ├─ controller/           # AuthController, CustomerController, TransactionController, StatsController
│  │  ├─ config/               # SecurityConfig, CorsConfig, JwtAuthenticationFilter
│  │  └─ security/             # JwtService
│  ├─ src/main/resources/
│  │  └─ application.properties
│  └─ pom.xml
│
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx, main.jsx
│  │  ├─ api/base44Client.js
│  │  ├─ Pages/
│  │  │  ├─ Login.jsx
│  │  │  ├─ Register.jsx
│  │  │  ├─ Home.jsx
│  │  │  ├─ Clients.jsx
│  │  │  ├─ ClientDetail.jsx
│  │  │  └─ Statistics.jsx
│  │  ├─ components/
│  │  │  ├─ clients/
│  │  │  ├─ transactions/
│  │  │  ├─ dashboard/
│  │  │  └─ ui/                # composants shadcn (button, input, card, dialog, etc.)
│  │  ├─ Layout.jsx
│  │  ├─ RequireAuth.jsx
│  │  ├─ lib/auth.js           # gestion du token JWT côté front
│  │  ├─ lib/utils.js          # cn(), helpers shadcn
│  │  └─ utils.js              # createPageUrl
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
└─ README.md

5. Installation
5.1 Prérequis

    Node.js ≥ 18
    npm (ou yarn)
    Java 17
    Maven
    PostgreSQL 16 (ou compatible)
