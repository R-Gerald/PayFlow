# PayFlow

Application web pour gérer les crédits clients d’un commerçant (petits commerces, boutiques, etc.).

Ce repo contient :

- un **frontend** React (Vite, Tailwind, shadcn/ui),
- un **backend** Spring Boot + PostgreSQL.

> Version actuelle : **v1** — pas encore d’authentification (tout est fait pour un merchant fixe).

---

## 1.Fonctionnalités

### Frontend

- Page **Accueil (Home)** :
  - Affiche les statistiques globales :
    - total dû,
    - montants récupérés,
    - nombre de clients avec crédit.
  - Recherche de clients.
  - Liste des clients avec leur solde dû.

- Page **Clients** :
  - Liste de tous les clients.
  - Recherche + filtres (tous / avec crédit / en retard).
  - Accès au détail d’un client.

- Page **Détail client** :
  - Affiche le solde dû du client.
  - Affiche l’historique des transactions (dettes / paiements).
  - Permet d’ajouter une **dette**.
  - Permet d’ajouter un **paiement**.

- Page **Statistiques** :
  - Totaux globaux (crédits/paiements),
  - Répartition des clients (avec crédit / à jour),
  - Graphiques (recharts).

### Backend

- Modèle de données (schéma PostgreSQL) :
  - `merchants` : commerçants (utilisateurs de l’app),
  - `customers` : clients du commerçant,
  - `transactions` : dettes (`CREDIT`) et paiements (`PAYMENT`).

- Endpoints REST principaux :

  - `POST /api/merchants`  
    Créer un merchant (pour le moment sans authentification complète).

  - `GET  /api/merchants/{merchantId}/customers`  
    Liste les clients d’un merchant, avec pour chacun :
    - `totalDue` calculé à partir des transactions.

  - `POST /api/merchants/{merchantId}/customers`  
    Créer un client.

  - `GET  /api/merchants/{merchantId}/transactions`  
    Liste toutes les transactions (dettes/paiements) du merchant.

  - `POST /api/merchants/{merchantId}/transactions`  
    Créer une transaction pour un client (dette ou paiement).

- CORS configuré pour permettre au front (`http://localhost:5173`) d’appeler le backend.

---

## 2. Structure du projet

```text
PayFlow/
├─ backend/                    # Projet Spring Boot
│  ├─ src/main/java/com/project/payflow/
│  │  ├─ PayFlowApplication.java
│  │  ├─ entities/             # Merchant, Customer, Transaction, TransactionType
│  │  ├─ repository/           # MerchantRepository, CustomerRepository, TransactionRepository
│  │  ├─ controller/           # MerchantController, CustomerController, TransactionController, StatsController
│  │  └─ config/               # CorsConfig
│  ├─ src/main/resources/
│  │  └─ application.properties
│  └─ pom.xml
│
├─ frontend/                   # Projet React + Vite
│  ├─ src/
│  │  ├─ App.jsx, main.jsx
│  │  ├─ api/baseClientbyG.js   # Intégration avec backend
│  │  ├─ Pages/                # Home, Clients, ClientDetail, Statistics
│  │  ├─ components/           # clients, transactions, dashboard, ui/...
│  │  ├─ lib/utils.js          # cn(), helpers shadcn
│  │  └─ utils.js              # createPageUrl
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
└─ README.md
```

3.Prérequis

    -Node.js ≥ 18
    -npm (ou yarn)
    -Java 17
    -Maven
    -PostgreSQL 16 (ou version compatible)
