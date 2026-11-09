const express = require('express');
const fs = require('fs');
const path = require('path');
const { Connection } = require('@solana/web3.js');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'cache_slug_database.json');

// Votre adresse Wallet Solana (Phantom)
const WALLET_ADDRESS = "2GbUebpJUYwuxUUPL3Ppo2x9thTCxV9LZqGF723d64zu";

// Connexion au réseau principal Solana
const solanaConnection = new Connection('https://api.mainnet-beta.solana.com');

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Servir les fichiers statiques du dossier courant (permet de charger index.html)
app.use(express.static(__dirname));

// Middleware de vérification du paiement Solana
async function verifySolanaPayment(req, res, next) {
    const txSignature = req.query.tx; // L'utilisateur passe ?tx=SIGNATURE

    if (!txSignature) {
        return res.status(401).json({
            error: "Accès refusé. Paiement requis.",
            wallet_destinataire: WALLET_ADDRESS,
            message: "Veuillez effectuer un transfert sur ce wallet et ajouter la signature dans l'URL (?tx=SIGNATURE)"
        });
    }

    try {
        const tx = await solanaConnection.getTransaction(txSignature, {
            maxSupportedTransactionVersion: 0
        });

        if (!tx) {
            return res.status(400).json({ error: "Transaction introuvable sur la blockchain." });
        }

        // Vérification basique que votre wallet est impliqué dans la transaction
        const accountKeys = tx.transaction.message.getAccountKeys();
        let isForMe = false;

        for (let i = 0; i < accountKeys.length; i++) {
            if (accountKeys.get(i).toBase58() === WALLET_ADDRESS) {
                isForMe = true;
                break;
            }
        }

        if (!isForMe) {
            return res.status(403).json({ error: "La transaction n'est pas liée à votre wallet." });
        }

        // Paiement validé, on laisse passer
        next();

    } catch (err) {
        console.error("Erreur de vérification blockchain :", err);
        res.status(500).json({ error: "Erreur technique lors de la vérification du paiement." });
    }
}

// Route 1 : Configuration publique (pour voir le wallet et le réseau)
app.get('/api/config', (req, res) => {
    res.json({
        wallet: WALLET_ADDRESS,
        network: "solana",
        currency: "USDC / SOL"
    });
});

// Route 2 : Toutes les tendances (PROTÉGÉE par le paiement)
app.get('/api/trends', verifySolanaPayment, (req, res) => {
    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Impossible de charger la base de données." });
        }

        try {
            const jsonData = JSON.parse(data);
            res.json({
                success: true,
                wallet: WALLET_ADDRESS,
                ...jsonData
            });
        } catch (parseErr) {
            res.status(500).json({ error: "Format de données corrompu." });
        }
    });
});

// Route 3 : Tendances par région (PROTÉGÉE par le paiement)
app.get('/api/trends/:region', verifySolanaPayment, (req, res) => {
    const region = req.params.region.toLowerCase();

    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Impossible de charger la base de données." });
        }

        try {
            const jsonData = JSON.parse(data);

            if (jsonData[region]) {
                res.json({
                    success: true,
                    wallet: WALLET_ADDRESS,
                    region: region,
                    trends: jsonData[region],
                    last_updated: jsonData.last_updated
                });
            } else {
                res.status(404).json({ error: `Région '${region}' introuvable dans la base de données.` });
            }
        } catch (parseErr) {
            res.status(500).json({ error: "Format de données corrompu." });
        }
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`💼 Wallet configuré : ${WALLET_ADDRESS}`);
    console.log(`🔒 Système de paiement Solana actif !`);
});