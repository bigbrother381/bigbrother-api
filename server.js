const express = require('express');
const fs = require('fs');
const path = require('path');
const { Connection } = require('@solana/web3.js');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'cache_slang_database.json');
const USED_TX_FILE = path.join(__dirname, 'used_signatures.json');

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

// Servir les fichiers statiques du dossier courant
app.use(express.static(__dirname));

// Fonctions utilitaires pour l'anti-rejeu
function getUsedSignatures() {
    if (!fs.existsSync(USED_TX_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(USED_TX_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveUsedSignature(txSignature) {
    const used = getUsedSignatures();
    if (!used.includes(txSignature)) {
        used.push(txSignature);
        fs.writeFileSync(USED_TX_FILE, JSON.stringify(used, null, 2));
    }
}

// Middleware de vérification du paiement Solana (x402 + Anti-rejeu)
async function verifySolanaPayment(req, res, next) {
    const txSignature = req.query.tx; // L'utilisateur passe ?tx=SIGNATURE

    if (!txSignature) {
        return res.status(402).json({ 
            error: "Payment Required",
            wallet_destinataire: WALLET_ADDRESS,
            message: "Veuillez effectuer un transfert sur ce wallet et ajouter la signature dans l'URL (?tx=SIGNATURE)"
        });
    }

    // Vérification Anti-rejeu : la signature a-t-elle déjà été consommée ?
    const usedSignatures = getUsedSignatures();
    if (usedSignatures.includes(txSignature)) {
        return res.status(403).json({
            error: "Accès refusé. Cette signature de transaction a déjà été utilisée."
        });
    }

    try {
        const tx = await solanaConnection.getTransaction(txSignature, {
            maxSupportedTransactionVersion: 0
        });

        if (!tx) {
            return res.status(400).json({ error: "Transaction introuvable sur la blockchain." });
        }

        // Vérification que votre wallet est impliqué dans la transaction
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

        // Enregistrer la signature pour empêcher sa réutilisation
        saveUsedSignature(txSignature);

        // Paiement validé, on laisse passer
        next();

    } catch (err) {
        console.error("Erreur de vérification blockchain :", err);
        res.status(500).json({ error: "Erreur technique lors de la vérification du paiement." });
    }
}

// Route 1 : Configuration publique
app.get('/api/config', (req, res) => {
    res.json({
        wallet: WALLET_ADDRESS,
        network: "solana",
        currency: "SOL"
    });
});

// Route 2 : Toutes les tendances (PROTÉGÉE)
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

// Route 3 : Tendances par région (PROTÉGÉE)
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
    console.log(`🔒 Système de paiement x402 + Anti-rejeu actif !`);
});
