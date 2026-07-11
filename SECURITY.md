# Sécurité — Mini-portail IT de supervision

## Contrôles mis en place

- **Gitleaks** : scan automatique des secrets à chaque push. Résultat : aucun secret détecté.
- **Trivy** : scan de vulnérabilités de l'image Docker à chaque push.
- **npm audit** : audit des dépendances Node.js à chaque push.
- Aucun mot de passe en dur dans le code — configuration via variables d'environnement (`.env`, exclu du dépôt via `.gitignore`).

## Vulnérabilités détectées (scan Trivy)

Le scan initial (image mono-stage) faisait remonter un nombre élevé de CVEs `CRITICAL`/`HIGH`, majoritairement liées à des paquets **non utilisés en exécution** : `python3`, `perl`, `gcc/g++` et leurs dépendances (installés uniquement pour compiler le module natif `better-sqlite3`).

**Action corrective** : passage à un `Dockerfile` multi-stage. Les outils de compilation sont utilisés dans une étape `builder` intermédiaire et ne sont plus présents dans l'image finale livrée, ce qui réduit significativement la surface d'attaque et le nombre de CVEs remontées.

**Vulnérabilités résiduelles acceptées** : les CVEs liées au noyau Linux (`linux-libc-dev`, ex. CVE-2026-43185) proviennent de l'image de base Debian et ne sont pas exploitables dans le contexte d'un conteneur applicatif standard (elles nécessiteraient un accès direct au noyau hôte). Elles sont documentées ici plutôt que corrigées, car hors du périmètre applicatif de ce projet.

## Audit des dépendances npm

Voir les logs du job `security-scans` dans GitHub Actions (onglet Actions) pour le détail à jour. Aucune vulnérabilité `CRITICAL` bloquante identifiée sur les dépendances directes du projet (`express`, `better-sqlite3`, `dotenv`, `cors`) au moment de la rédaction.

## Limites

Le pipeline CI/CD ne bloque pas automatiquement en cas de vulnérabilité détectée (`exit-code: 0` sur Trivy) — choix assumé pour ce projet pédagogique, privilégiant la détection et la documentation plutôt que le blocage strict, qui serait la prochaine étape dans un contexte de production.