# 🚀 Guide de déploiement avec Docker

## Prérequis
- Docker installé ([Installation](https://docs.docker.com/get-docker/))
- Docker Compose (généralement inclus avec Docker Desktop)
- Clé API Google GenAI

## 📝 Étape 1 : Configuration

### 1.1 Créer le fichier `.env`
```bash
cp .env.example .env
```

Éditez `.env` et ajoutez votre clé Google GenAI :
```
VITE_GOOGLE_GENAI_KEY=votre_clé_api_google
NODE_ENV=production
```

## 🐳 Étape 2 : Déploiement avec Docker Compose (recommandé)

### Build et lancer
```bash
# Builder et démarrer
docker-compose up -d

# Vérifier les logs
docker-compose logs -f pharmapilote
```

### Arrêter l'application
```bash
docker-compose down
```

### Redémarrer
```bash
docker-compose restart
```

## 🐳 Étape 3 : Alternative - Docker seul

### Build l'image
```bash
docker build -t pharmapilote:latest .
```

### Lancer le conteneur
```bash
docker run -d \
  --name pharmapilote-app \
  -p 3000:3000 \
  -e VITE_GOOGLE_GENAI_KEY=votre_clé_api \
  -e NODE_ENV=production \
  --restart unless-stopped \
  pharmapilote:latest
```

### Vérifier l'état
```bash
docker ps
docker logs pharmapilote-app
```

### Arrêter le conteneur
```bash
docker stop pharmapilote-app
docker rm pharmapilote-app
```

## 🌐 Accéder à l'application
L'application sera disponible sur : **http://localhost:3000**

## 📊 Monitoring et maintenance

### Voir les logs en temps réel
```bash
docker-compose logs -f
# ou
docker logs -f pharmapilote-app
```

### Vérifier l'utilisation des ressources
```bash
docker stats
```

### Nettoyer les images inutilisées
```bash
docker system prune -a
```

## 🔄 Mise à jour de l'application

### Avec Docker Compose
```bash
# Récupérer les derniers changements
git pull

# Rebuild et redémarrer
docker-compose up -d --build
```

### Avec Docker seul
```bash
git pull
docker build -t pharmapilote:latest .
docker stop pharmapilote-app
docker rm pharmapilote-app
docker run -d \
  --name pharmapilote-app \
  -p 3000:3000 \
  -e VITE_GOOGLE_GENAI_KEY=votre_clé_api \
  -e NODE_ENV=production \
  --restart unless-stopped \
  pharmapilote:latest
```

## 🚀 Déploiement sur un serveur distant (VPS)

### 1. Connectez-vous au serveur
```bash
ssh user@your_server_ip
```

### 2. Installer Docker
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# Démarrer le service
sudo systemctl start docker
sudo systemctl enable docker
```

### 3. Cloner et déployer
```bash
git clone https://github.com/sanankoro-cloud/pharmapiloteapp.git
cd pharmapiloteapp

# Créer le fichier .env avec vos variables
nano .env

# Lancer avec Docker Compose
docker-compose up -d
```

### 4. Configurer un reverse proxy (Nginx)
```bash
sudo apt install nginx
```

Créer `/etc/nginx/sites-available/pharmapilote` :
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer la configuration :
```bash
sudo ln -s /etc/nginx/sites-available/pharmapilote /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL avec Let's Encrypt (optionnel)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

## 📋 Structure des fichiers créés
```
pharmapiloteapp/
├── Dockerfile          # Configuration Docker
├── .dockerignore       # Fichiers à ignorer
├── docker-compose.yml  # Orchestration multi-conteneur
├── .env.example        # Template des variables
└── DEPLOYMENT.md       # Ce fichier
```

## 💡 Conseils de sécurité
- ✅ Ne commiter jamais le `.env` (il est dans `.gitignore`)
- ✅ Utilisez des secrets sécurisés pour la clé API Google
- ✅ Mettez à jour régulièrement les images Docker
- ✅ Utilisez HTTPS en production
- ✅ Limitez les permissions du conteneur

## ❓ Dépannage

### Erreur : "Cannot find module"
```bash
docker-compose up -d --build
```

### Erreur : "Port already in use"
Changez le port dans `docker-compose.yml` :
```yaml
ports:
  - "8000:3000"  # Accédez via http://localhost:8000
```

### Application lente ou crash
```bash
# Augmentez les ressources dans docker-compose.yml
services:
  pharmapilote:
    # ...
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

## 📞 Support
Pour plus d'aide, consultez :
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation React](https://react.dev/)
