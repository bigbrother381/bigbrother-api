import json
import time

def scrape_trends():
    print("🔄 Démarrage de la collecte des tendances...")
    
    # Données FR
    french_trends = [
        {
            "term": "sigma",
            "language": "fr",
            "region": "FR",
            "definition": "Se dit d'un individu indépendant qui suit sa propre voie.",
            "source": "TikTok/Instagram"
        },
        {
            "term": "quoicoubeh",
            "language": "fr",
            "region": "FR",
            "definition": "Expression de provocation verbale ludique.",
            "source": "TikTok"
        }
    ]
    
    # Données US
    us_trends = [
        {
            "term": "rizz",
            "language": "en",
            "region": "US",
            "definition": "Charme ou capacité de séduction (court pour charisma).",
            "source": "TikTok/X"
        },
        {
            "term": "skibidi",
            "language": "en",
            "region": "US",
            "definition": "Terme absurde désignant quelque chose de cool, mauvais ou sans sens selon le contexte.",
            "source": "YouTube Shorts/TikTok"
        },
        {
            "term": "fanum tax",
            "language": "en",
            "region": "US",
            "definition": "Le fait de voler de la nourriture à un ami.",
            "source": "Twitch/TikTok"
        }
    ]

    # Données ASIA
    asia_trends = [
        {
            "term": "oppa",
            "language": "ko",
            "region": "KR",
            "definition": "Terme coréen utilisé par une femme pour s'adresser à un homme plus âgé qu'elle.",
            "source": "K-Drama/TikTok"
        },
        {
            "term": "yowai mo",
            "language": "ja",
            "region": "JP",
            "definition": "Expression japonaise popularisée par Jujutsu Kaisen signifiant 'tu es faible'.",
            "source": "Anime/TikTok"
        }
    ]

    # Dictionnaire global lu par le serveur Node.js
    database = {
        "fr": french_trends,
        "us": us_trends,
        "asia": asia_trends,
        "last_updated": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }

    # Sauvegarde dans le fichier JSON partagé
    with open("cache_slang_database.json", "w", encoding="utf-8") as f:
        json.dump(database, f, ensure_ascii=False, indent=2)

    print("✅ Base de données mise à jour avec succès (FR, US & ASIA) !")

if __name__ == "__main__":
    scrape_trends()