# 👁️ BigBrother Trends API

> **Pay-per-Call Agent-to-Agent (M2M) & Human Web3 Trends API** powered by Solana micro-transactions.

`bigbrother-api` est une API de tendances en temps réel conçue pour être consommée de manière **totalement autonome par des agents d'intelligence artificielle (M2M)** ainsi que par des applications humaines. Elle intègre le standard **HTTP 402 (Payment Required)** et les micro-paiements sur la blockchain Solana.

---

## ⚡ Fonctionnalités

- 🤖 **Agent-First (M2M Ready)** : Réponse structurée avec le statut `HTTP 402` permettant aux agents IA d'effectuer des paiements automatiques en Solana.
- 💳 **Micro-paiements Web3** : Facturation à la requête (Pay-per-Call) via des transactions vérifiées sur la blockchain Solana.
- 🔄 **Mises à jour automatisées** : Scraper Python autonome tournant sur **GitHub Actions** mis à jour quotidiennement sans serveur dédié.
- 🌐 **Architecture hybride** : Compatible avec l'interface web (Phantom Wallet) et les requêtes programmatic (cURL, Python, JS, LangChain, MCP).

---

## 🚀 Endpoints API

### 1. Configuration Publique
Découverte du wallet de destination et des réseaux pris en charge.

- **URL :** `GET /api/config`
- **Accès :** Gratuit / Public

### 2. Tendances Globales (Protégé)
Récupération de l'ensemble des tendances du cache.

- **URL :** `GET /api/trends`
- **Header requis :** `x-payment-signature: <SIGNATURE_SOLANA>` (ou paramètre `?tx=<SIGNATURE_SOLANA>`)
- **Accès sans signature :** Renseigne le code `402 Payment Required` et les détails du transfert.

### 3. Tendances par Région (Protégé)
Récupération des tendances pour une zone spécifique (ex: `fr`, `us`, `asia`).

- **URL :** `GET /api/trends/:region`
- **Header requis :** `x-payment-signature: <SIGNATURE_SOLANA>` (ou paramètre `?tx=<SIGNATURE_SOLANA>`)

---

## 🤖 Flux d'intégration pour Agents IA (HTTP 402)

1. **Requête initiale :** L'agent IA envoie une requête `GET` sur `/api/trends`.
2. **Réponse 402 :** Si aucune signature n'est fournie, le serveur répond avec un statut `402 Payment Required` :
   ```json
   {
     "error": "Accès refusé. Paiement requis.",
     "wallet_destinataire": "2GbUebpJUYwuxUUPL3Ppo2x9thTCxV9LZqGF723d64zu",
     "message": "Veuillez effectuer un transfert sur ce wallet et ajouter la signature dans l'URL (?tx=SIGNATURE)"
   }