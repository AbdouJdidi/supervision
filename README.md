# Mini-portail IT de supervision

## But du projet

Application web pédagogique permettant de surveiller la disponibilité de services IT (URLs, APIs, serveurs) via des vérifications HTTP simples. Le portail affiche un statut UP/DOWN avec horodatage de la dernière vérification.

Ce projet a été réalisé dans le cadre d'un stage DevOps/IT/Sécurité. Il ne remplace pas des solutions professionnelles comme Zabbix, Grafana ou Prometheus — l'objectif est de comprendre les principes de base du DevOps appliqués à un cas concret.

## Technologies utilisées

- **Backend** : Node.js + Express
- **Base de données** : SQLite (via better-sqlite3)
- **Frontend** : HTML / CSS / JavaScript natif
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Sécurité** : Gitleaks (détection de secrets), Trivy (scan d'image Docker), npm audit (audit des dépendances)

## Architecture : 
mini-supervision/
├── backend/
│   ├── server.js       # Point d'entrée Express, sert aussi le frontend
│   ├── db.js            # Connexion et schéma SQLite
│   ├── routes/
│   │   └── services.js  # Routes API (CRUD + vérification)
│   └── data/             # Fichier SQLite (volume Docker)
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .github/workflows/ci.yml   # Pipeline CI/CD
├── Dockerfile
├── docker-compose.yml
└── .dockerignore


Le backend Express expose une API REST (`/api/services`) et sert aussi les fichiers statiques du frontend — un seul serveur, un seul port (3000).

## Prérequis

- Node.js 20+ (recommandé via [nvm](https://github.com/nvm-sh/nvm))
- Docker + Docker Compose
- Git

## Installation et lancement en local (sans Docker)

```bash
git clone https://github.com/TON_USERNAME/mini-supervision.git
cd mini-supervision/backend
npm install
cp .env.example .env   # à adapter si besoin
npm run dev
```

Ouvrir ensuite `http://localhost:3000`.

## Lancement avec Docker Compose

```bash
git clone https://github.com/TON_USERNAME/mini-supervision.git
cd mini-supervision
docker compose up -d --build
```

Vérifier que le conteneur tourne :

```bash
docker compose ps
docker compose logs -f
```

Ouvrir ensuite `http://localhost:3000`.

Pour arrêter :

```bash
docker compose down
```

## Fonctionnement du pipeline CI/CD

Le pipeline (`.github/workflows/ci.yml`) se déclenche à chaque `push` ou `pull request` sur la branche `main`, et exécute 3 jobs :

1. **build-and-test** : installation des dépendances et vérification que le serveur démarre sans erreur
2. **security-scans** : scan des secrets avec Gitleaks + audit des dépendances npm
3. **docker-build-and-scan** : construction de l'image Docker + scan de vulnérabilités avec Trivy

Les résultats sont consultables dans l'onglet **Actions** du dépôt GitHub.

## Contrôles de sécurité mis en place

- Aucun mot de passe ou secret en dur dans le code — utilisation de variables d'environnement (`.env`, non commité, voir `.gitignore`)
- Scan automatique des secrets à chaque push (Gitleaks)
- Scan de vulnérabilités de l'image Docker (Trivy)
- Audit des dépendances npm (`npm audit`)
- `.dockerignore` pour éviter d'embarquer des fichiers sensibles ou locaux dans l'image

## Limites du projet

- Pas d'authentification ni de gestion des rôles utilisateurs
- Pas de déploiement Kubernetes
- Pas de monitoring temps réel avancé ni d'alertes email/SMS
- Pas d'intégration Prometheus/Grafana
- Le pipeline CI/CD ne bloque pas en cas de vulnérabilité détectée (mode "détection et documentation" plutôt que blocage, adapté au périmètre pédagogique du stage)

## Améliorations possibles

- Authentification simple
- Historique des vérifications et page de statistiques
- Export CSV des résultats
- Alerte email en cas de service DOWN
- Déploiement automatisé sur serveur de test via le pipeline CI/CD