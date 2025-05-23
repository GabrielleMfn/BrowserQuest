console.log("debug.js est bien chargé !");
var fs = require('fs'),
    Metrics = require('./metrics');
    express = require('express');
    path = require('path');

function main(config) {
    var ws = require("./ws"),
        WorldServer = require("./worldserver"),
        Log = require('./logger'),
        _ = require('underscore'),
        app = express(),
        server = new ws.MultiVersionWebsocketServer(config.port),
        metrics = config.metrics_enabled ? new Metrics(config) : null;
        worlds = [],
        lastTotalPlayers = 0;

        // Stockage en mémoire pour les tentatives par IP
    const attemptsByIP = {};
    const maxAttemptsPerMinute = 10; // Limite de 10 tentatives par minute
    const blockDuration = 10 * 60 * 1000; // Bloquer pendant 10 minutes

    // Middleware pour limiter les tentatives par IP
    function rateLimiter(req, res, next) {
        const ipAddr = req.connection.remoteAddress;
        const now = Date.now();

        if (!attemptsByIP[ipAddr]) {
            attemptsByIP[ipAddr] = { attempts: [], blockedUntil: 0 };
        }

        const ipData = attemptsByIP[ipAddr];

        // Vérifiez si l'IP est bloquée
        if (ipData.blockedUntil > now) {
            const retrySecs = Math.round((ipData.blockedUntil - now) / 1000);
            res.set('Retry-After', String(retrySecs));
            return res.status(429).send('Too Many Requests');
        }

        // Nettoyez les anciennes tentatives
        ipData.attempts = ipData.attempts.filter((timestamp) => now - timestamp < 60 * 1000); // 1 minute

        // Vérifiez les limites
        if (ipData.attempts.length >= maxAttemptsPerMinute) {
            ipData.blockedUntil = now + blockDuration;
            const retrySecs = Math.round(blockDuration / 1000);
            res.set('Retry-After', String(retrySecs));
            return res.status(429).send('Too Many Requests');
        }

        // Ajoutez une tentative
        ipData.attempts.push(now);

        next();
    }

    // Ajout du middleware de limitation sur une route spécifique
    app.post('/start', rateLimiter, (req, res) => {
        const playerName = req.body.name; // Récupère le prénom du joueur
        if (!playerName || playerName.trim() === '') {
            return res.status(400).send('Player name is required.');
        }});

        app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', true);
            next();
        });
        
        app.use(express.static('client-build'));
        app.use('/shared', express.static(path.join(__dirname, '../../shared')));

        app.listen(8080, '::', function() {
            console.log('Front-end is running on http://localhost:8080'); 
        });

        app.use((req, res) => {
            res.status(404).send('Not Found');
        });


        checkPopulationInterval = setInterval(function() {
            if(metrics && metrics.isReady) {
                metrics.getTotalPlayers(function(totalPlayers) {
                    if(totalPlayers !== lastTotalPlayers) {
                        lastTotalPlayers = totalPlayers;
                        _.each(worlds, function(world) {
                            world.updatePopulation(totalPlayers);
                        });
                    }
                });
            }
        }, 1000);
    
    switch(config.debug_level) {
        case "error":
            log = new Log(Log.ERROR); break;
        case "debug":
            log = new Log(Log.DEBUG); break;
        case "info":
            log = new Log(Log.INFO); break;
        default:
            log = new Log(Log.INFO);    
    };
    
    log.info("Starting BrowserQuest game server...");
    
    server.onConnect(function(connection) {
        var world,
            connect = function() {
                if(world) {
                    world.connect_callback(new Player(connection, world));
                }
            };
        
        if(metrics) {
            metrics.getOpenWorldCount(function(open_world_count) {

                world = _.min(_.first(worlds, open_world_count), function(w) { return w.playerCount; });
                connect();
            });
        }
        else {

            world = _.detect(worlds, function(world) {
                return world.playerCount < config.nb_players_per_world;
            });
            world.updatePopulation();
            connect();
        }
    });

    server.onError(function() {
        log.error(Array.prototype.join.call(arguments, ", "));
    });
    
    var onPopulationChange = function() {
        metrics.updatePlayerCounters(worlds, function(totalPlayers) {
            _.each(worlds, function(world) {
                world.updatePopulation(totalPlayers);
            });
        });
        metrics.updateWorldDistribution(getWorldDistribution(worlds));
    };

    _.each(_.range(config.nb_worlds), function(i) {
        var world = new WorldServer('world'+ (i+1), config.nb_players_per_world, server);
        world.run(config.map_filepath);
        worlds.push(world);
        if(metrics) {
            world.onPlayerAdded(onPopulationChange);
            world.onPlayerRemoved(onPopulationChange);
        }
    });
    
    server.onRequestStatus(function() {
        return JSON.stringify(getWorldDistribution(worlds));
    });
    
    if(config.metrics_enabled) {
        metrics.ready(function() {
            onPopulationChange();
        });
    }
    
    process.on('uncaughtException', function (e) {
        log.error('uncaughtException: ' + e);
    });
}

function getWorldDistribution(worlds) {
    var distribution = [];
    
    _.each(worlds, function(world) {
        distribution.push(world.playerCount);
    });
    return distribution;
}

function getConfigFile(path, callback) {
    fs.readFile(path, 'utf8', function(err, json_string) {
        if(err) {
            console.error("Could not open config file:", err.path);
            callback(null);
        } else {
            callback(JSON.parse(json_string));
        }
    });
}

var defaultConfigPath = './server/config.json',
    customConfigPath = './server/config_local.json';

process.argv.forEach(function (val, index, array) {
    if(index === 2) {
        customConfigPath = val;
    }
});

getConfigFile(defaultConfigPath, function(defaultConfig) {
    getConfigFile(customConfigPath, function(localConfig) {
        if(localConfig) {
            main(localConfig);
        } else if(defaultConfig) {
            main(defaultConfig);
        } else {
            console.error("Server cannot start without any configuration file.");
            process.exit(1);
        }
    });
});
