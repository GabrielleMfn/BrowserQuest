BrowserQuest
============

BrowserQuest is a HTML5/JavaScript multiplayer game experiment.


Documentation
-------------

Pour lancer le projet :

/!\ Si vous êtes sur Windows, vous pouvez être amené à rencontrer un problème avec http-server et autre. Veuillez vérifier les permissions suivantes :
* Win+S : Tapez PowerShell 
* Exécutez Windows PowerShell en tant qu'administrateur
* Exécutez la commande Get-ExecutionPolicy
* Si ce n'est pas RemoteSigned :
    * Exécutez Set-ExecutionPolicy RemoteSigned puis o/y

PS : Si plus tard vous voulez remettre la permission d'avant : 
    * Exécutez Set-ExecutionPolicy Restricted

* Assurez-vous d'être au bon endroit dans l'arborescence
* Exécutez la commande npm install
* Exécutez la commande node server/js/main.js

L'application est initialisée. Enjoy !


Partie Docker:

* Tirez l'image Docker du jeu :
    * docker pull amineo2005/browser-quest

* Lancez le jeu :
    * docker run -p 80:3000 amineo2005/browser-quest
    * Vous pouvez accéder au jeu sur http://localhost:3000
* Pour arrêter le jeu:
    * docker stop <id>

* Lancer le docker-compose.yml pour lancer le serveur et l'application en même temps :
    * docker-compose up -d
    * Vous pouvez accéder au jeu sur http://localhost:80
* Pour arrêter le docker-compose.yml :
    * docker-compose down







License
-------

Code is licensed under MPL 2.0. Content is licensed under CC-BY-SA 3.0.
See the LICENSE file for details.


Credits
-------
Created by [Little Workshop](http://www.littleworkshop.fr):

* Franck Lecollinet - [@whatthefranck](http://twitter.com/whatthefranck)
* Guillaume Lecollinet - [@glecollinet](http://twitter.com/glecollinet)

Projet Mis à jour par : 
* M'FOUMOUNE Gabrielle, 
* OUARDI Ahmed-amine, 
* PILLAH Niali henri guy-harvyn 
* MABANZA Danali

