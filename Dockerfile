# Utiliser une image officielle de Node
FROM node:18

# Créer un répertoire dans le conteneur
WORKDIR /server/js

# Copier les fichiers
COPY package*.json ./
RUN npm install
COPY . .

# Lancer l’application
CMD ["npm", "start"]
