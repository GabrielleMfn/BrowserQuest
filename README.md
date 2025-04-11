# BrowserQuest

BrowserQuest is a HTML5/JavaScript multiplayer game experiment.

## Documentation

Pour lancer le projet :

/!\ Si vous êtes sur Windows, vous pouvez être amené à rencontrer un problème avec http-server et autre. Veuillez vérifier les permissions suivantes :

- Win+S : Tapez PowerShell
- Exécutez Windows PowerShell en tant qu'administrateur
- Exécutez la commande Get-ExecutionPolicy
- Si ce n'est pas RemoteSigned :
  - Exécutez Set-ExecutionPolicy RemoteSigned puis o/y

PS : Si plus tard vous voulez remettre la permission d'avant : \* Exécutez Set-ExecutionPolicy Restricted

- Assurez-vous d'être au bon endroit dans l'arborescence
- Exécutez la commande npm install
- Exécutez la commande node server/js/main.js

L'application est initialisée. Enjoy !


# Docker:

/!\ Pour la partie Docker vous pouvez rencontrer des difficultés car on a adapté le projet en incluant l'étape 2 : Migration IPv4 vers IPv6 Adapter le serveur Node.js pour supporter les connexions IPv6, en assurant une compatibilité Dual Stack.

Pour eviter que l'app ne s'affiche pas veillez ouvrir le fichier daemon.json qui se trouve:

* Sur Windows :
  * C:\Utilisateur\votreUtilisateur\ .docker\daemon.json
  * C:\ProgramData\Docker\config\daemon.json

* Sur Mac : 
* Verifier/Acceder au fichier depuis le docker desktop -> settings -> docker engine

Le fichier ressemble à ça :

{
 "builder": {
 
  "gc": {
  
   "defaultKeepStorage": "20GB",
   
   "enabled": true
   
  }
  
 },
 
 "experimental": false,

 // ajouter ceci :
 
 "ipv6": true,
 
 "fixed-cidr-v6": "2001:db8:1::/64"
 
}

Enregistrer et Relancer Docker 
Problème résolu ! vous pouver suivre les consignes si dessous 

- Tirez l'image Docker du jeu :

  - docker pull amineo2005/browser-quest

- Lancez le jeu :
  - docker run -p 80:3000 amineo2005/browser-quest
  - Vous pouvez accéder au jeu sur http://localhost:3000
- Pour arrêter le jeu:

  - docker stop 



- Lancer le docker-compose.yml pour lancer le serveur et l'application en même temps :
  - docker-compose up -d
  - Vous pouvez accéder au jeu sur http://localhost:8080
- Pour arrêter le docker-compose.yml :

  - docker-compose down

# Load Balancer/Nginx

/!\ Vous pouvez rencontrer des problème avec Nginx avec Windows :
La config qui se trouve dans le dossier nginx/conf -> nginx.conf mettez la dans le fichier nginx.conf où vous avez télécharger Nginx. 
Oubliez pas de changer la route au niveau de location : /Users/VotreUser/BrowserQuest/client;

- Ouvrir un premier terminal, et entrer la commande


- Une fois avoir lancer le jeu sur un terminal, ouvrir un deuxieme terminal, et entrer :

  - cd .\server\js
  - node main.js config_local_1.json

- Ouvrir un troisieme terminal, et entrer la commande :

  - cd .\server\js
  - node main.js config_local_2.json

- Ouvrir un quatrième terminal, dans la racine et entrer cette commande :
  - start nginx.exe

## License

Code is licensed under MPL 2.0. Content is licensed under CC-BY-SA 3.0.
See the LICENSE file for details.

## Credits

Created by [Little Workshop](http://www.littleworkshop.fr):

- Franck Lecollinet - [@whatthefranck](http://twitter.com/whatthefranck)
- Guillaume Lecollinet - [@glecollinet](http://twitter.com/glecollinet)

Projet Mis à jour par :

- M'FOUMOUNE Gabrielle,
- OUARDI Ahmed-amine,
- PILLAH Niali henri guy-harvyn
- MABANZA Danali
