# 🌐 Big Brother API — Real-Time Geopolitical & Energy Intelligence (x402 M2M Protocol)

[![API Status](https://img.shields.io/badge/API-Online-brightgreen)](https://big-brother-api.onrender.com/health)
[![Protocol](https://img.shields.io/badge/Paywall-x402%20Solana%20USDC-purple)](https://solana.com)
[![Architecture](https://img.shields.io/badge/Architecture-Agent--First%20%2F%20M2M-blue)](#-agent-integration-quickstart)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-cyan)](https://neon.tech)

> **Agent-First Autonomous Intelligence API**  
> Streamlined Machine-to-Machine (M2M) intelligence delivery for Autonomous AI Agents. Provides structured JSON data covering global geopolitical alerts, energy market shifts, and critical maritime logistics.

---

## 🤖 Agent Integration Quickstart

### 1. Healthcheck (Free Endpoint)
Before executing paid transactions, check system health and database availability:
```http
GET /health HTTP/1.1
Host: big-brother-api.onrender.com
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-11-12T01:20:00.000Z"
}
```

---

### 2. Request Data & Paywall Flow (HTTP 402)
To request intelligence feed, call `/api/v1/intel`. If unauthenticated/unpaid, the API responds with `402 Payment Required` and execution instructions.

```http
GET /api/v1/intel?category=energy&limit=50 HTTP/1.1
Host: big-brother-api.onrender.com
```

**Response (402 Payment Required):**
```json
{
  "status": 402,
  "error": "Payment Required",
  "message": "Access requires a 0.01 USDC transfer on Solana",
  "payment_details": {
    "protocol": "x402",
    "network": "solana-mainnet",
    "currency": "USDC",
    "amount": 0.01,
    "recipient_wallet": "2GbUebpJUYwuxUUPL3Ppo2x9thTCxV9LZqGF723d64zu",
    "usdc_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "max_age_seconds": 3600
  },
  "instructions": "Send transaction, then retry request with header 'x-payment-signature: <tx_signature>'"
}
```

---

### 3. Fulfill Payment & Access Data (HTTP 200)
1. Execute SPL USDC transfer of **0.01 USDC** to `2GbUebpJUYwuxUUPL3Ppo2x9thTCxV9LZqGF723d64zu` on Solana Mainnet.
2. Re-issue request including the `x-payment-signature` header:

```http
GET /api/v1/intel?category=geopolitics&limit=10 HTTP/1.1
Host: big-brother-api.onrender.com
x-payment-signature: 5wHu...txSignatureHash...9kPz
```

**Response (200 OK):**
```json
{
  "status": "success",
  "served_at": "2026-11-12T01:20:05.000Z",
  "retention_days": 60,
  "payment": {
    "payer": "BN8dN6...M1rm",
    "amount": 0.01,
    "currency": "USDC"
  },
  "data": {
    "latest": {
      "timestamp": "2026-11-12T01:15:00.000Z",
      "summary": "Global Monitoring Snapshot",
      "alerts_count": 3
    }
  },
  "history": {
    "order": "newest_first",
    "total": 120,
    "count": 10,
    "items": [
      {
        "id": "cm3...id",
        "category": "geopolitics",
        "title": "Red Sea Shipping Channel Tensions",
        "urgency": "HIGH",
        "payload": { ... },
        "timestamp": "2026-11-12T01:00:00.000Z"
      }
    ]
  }
}
```

---

## 🛠 API Query Parameters

| Parameter | Type | Allowed Values | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `category` | String | `geopolitics`, `energy`, `maritime` | *All* | Filter output feed by operational domain. |
| `limit` | Integer | `1` to `500` | `100` | Max entries returned in `history.items`. |

> **Note:** Query validation errors (`400 Bad Request`) are evaluated **before** payment verification. Agents never lose funds on malformed parameters.

---

## 🔒 Security & Replay Protection

- **Replay Protection:** Every transaction signature is recorded on Neon PostgreSQL (`PaymentTransaction`). Re-using a spent signature returns `402 Transaction already spent`.
- **Max Age Control:** Payments older than `PAYMENT_MAX_AGE_SECONDS` (3600s) are automatically rejected.
- **RPC Availability:** If RPC validation fails temporarily, API returns `503 Service Unavailable`—allowing agents to retry safely with the same signature without burning tokens.

---

## ⚡ Error Codes Reference

| HTTP Code | Error Key | Cause | Action for Agent |
| :--- | :--- | :--- | :--- |
| `400` | `invalid_category` / `invalid_limit` | Query parameters outside valid bounds | Fix query parameters and retry (no payment needed). |
| `402` | `payment_required` | Missing `x-payment-signature` header | Perform 0.01 USDC transfer on Solana and submit TX hash. |
| `402` | `tx_spent` / `tx_invalid` | Signature already used or invalid on-chain TX | Generate a fresh USDC payment transaction. |
| `503` | `cache_unavailable` | Scraper initializing first data cycle | Wait 10–30 seconds and retry. |
| `503` | `rpc_unavailable` | Solana RPC rate-limited or unreachable | Retry request with the **same** signature in 5 seconds. |

---

## 📁 Repository & System Architecture

```text
mnp-bigbrother/
├── backend/
│   ├── server.js               # Express API entry point & routing
│   ├── middleware/x402.js      # Solana On-Chain USDC & anti-replay validator
│   ├── lib/intel-store.js      # Neon DB ingestion & historic data query
│   └── lib/retention.js        # Automatic 60-day data purging background job
├── scraper/
│   ├── intel_scraper.py        # Autonomous multi-source python aggregator
│   └── intel_cache.json        # Atomic local JSON buffer
├── backend/prisma/
│   └── schema.prisma           # PostgreSQL schema (IntelReport & PaymentTransaction)
├── Dockerfile                  # Single-container production runtime (Node + Python)
└── render.yaml                 # Infrastructure Blueprint configuration
```

---

## 📜 Maintenance & Data Retention Rules

1. **60-Day Retention Period:** `INTEL_RETENTION_DAYS=60` purges old intelligence snapshots automatically.
2. **Neon Serverless PostgreSQL:** Guarantees zero data loss across Render free-tier container restarts/sleep cycles.
3. **Uptime Monitoring:** Ping `GET /health` every 5 minutes to prevent container sleep for continuous 24/7 scraping.

---

© 2026 **Big Brother API** — Built for Machine-to-Machine Autonomous Economies.
