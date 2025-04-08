var cls = require("./lib/class"),
    url = require('url'),
    WebSocket = require("ws"), 
    http = require('http'),
    Utils = require('./utils'),
    _ = require('underscore'),
    BISON = require('bison'),
    WS = {},
    useBison = false;

module.exports = WS;


/**
 * Abstract Server and Connection classes
 */
var Server = cls.Class.extend({
    init: function(port) {
        this.port = port;
    },
    
    onConnect: function(callback) {
        this.connection_callback = callback;
    },
    
    onError: function(callback) {
        this.error_callback = callback;
    },
    
    broadcast: function(message) {
        throw "Not implemented";
    },
    
    forEachConnection: function(callback) {
        _.each(this._connections, callback);
    },
    
    addConnection: function(connection) {
        console.log('Adding connection with ID:', connection.id);
        this._connections[connection.id] = connection;
    },
    
    removeConnection: function(id) {
        console.log('Removing connection with ID:', id);
        delete this._connections[id];
    },
    
    getConnection: function(id) {
        return this._connections[id];
    }
});


var Connection = cls.Class.extend({
    init: function(id, connection, server) {
        this._connection = connection;
        this._server = server;
        this.id = id;
    },
    
    onClose: function(callback) {
        this.close_callback = callback;
    },
    
    listen: function(callback) {
        this.listen_callback = callback;
    },
    
    broadcast: function(message) {
        throw "Not implemented";
    },
    
    send: function(message) {
        throw "Not implemented";
    },
    
    sendUTF8: function(data) {
        throw "Not implemented";
    },
    
    close: function(logError) {
        console.log("Closing connection to " + this._connection.remoteAddress + ". Error: " + logError);
        this._connection.close();
    }
});



/**
 * MultiVersionWebsocketServer
 * 
 * Websocket server supporting draft-75, draft-76 and version 08+ of the WebSocket protocol.
 */
WS.MultiVersionWebsocketServer = Server.extend({
    _connections: {},
    _counter: 0,
    
    init: function(port) {
        var self = this;
        
        this._super(port);
        
        this._httpServer = http.createServer(function(request, response) {
            var path = url.parse(request.url).pathname;
            switch(path) {
                case '/status':
                    if(self.status_callback) {
                        response.writeHead(200);
                        response.write(self.status_callback());
                        break;
                    }
                default:
                    response.writeHead(404);
            }
            response.end();
        });
        this._httpServer.listen(port, function() {
            console.log("HTTP server is listening on port " + port);
        });
        
        // Remplacement de websocket-server par ws
        this._wsServer = new WebSocket.Server({ server: this._httpServer });
        this._wsServer.on('connection', function(socket, req) {
            console.log('New WebSocket connection from:', req.socket.remoteAddress);

            // Add remoteAddress property
            socket.remoteAddress = req.socket.remoteAddress;

            // We want to use "sendUTF" regardless of the server implementation
            socket.sendUTF = socket.send;
            var c = new WS.worlizeWebSocketConnection(self._createId(), socket, self);
            
            if(self.connection_callback) {
                console.log('Executing connection callback for connection ID:', c.id);
                self.connection_callback(c);
            }
            self.addConnection(c);

            socket.on('message', function(message) {
                console.log('Received message:', message);
            
                if(self.listen_callback) {
                    try {
                        if(useBison) {
                            self.listen_callback(BISON.decode(message));
                        } else {
                            self.listen_callback(JSON.parse(message));
                        }
                    } catch(e) {
                        console.error('Error processing message:', e);
                        if(e instanceof SyntaxError) {
                            c.close("Received message was not valid JSON.");
                        } else {
                            throw e;
                        }
                    }
                }
            });

            socket.on('close', function() {
                console.log('WebSocket connection closed for ID:', c.id);
                self.removeConnection(c.id);
            });

            socket.on('error', function(err) {
                console.error('WebSocket error for connection ID:', c.id, err);
            });
        });
    },
    
    _createId: function() {
        return '5' + Utils.random(99) + '' + (this._counter++);
    },
    
    broadcast: function(message) {
        console.log('Broadcasting message to all connections:', message);
        this.forEachConnection(function(connection) {
            connection.send(message);
        });
    },
    
    onRequestStatus: function(status_callback) {
        this.status_callback = status_callback;
    }
});


/**
 * Connection class for WebSocket (ws)
 */
WS.worlizeWebSocketConnection = Connection.extend({
    init: function(id, connection, server) {
        var self = this;
        
        this._super(id, connection, server);
        
        this._connection.on('message', function(message) {
            console.log('Connection ID:', self.id, 'received message:', message);
            if(self.listen_callback) {
                try {
                    if(useBison) {
                        self.listen_callback(BISON.decode(message));
                    } else {
                        self.listen_callback(JSON.parse(message));
                    }
                } catch(e) {
                    console.error('Error processing message for connection ID:', self.id, e);
                    if(e instanceof SyntaxError) {
                        self.close("Received message was not valid JSON.");
                    } else {
                        throw e;
                    }
                }
            }
        });
        
        this._connection.on('close', function() {
            console.log('WebSocket connection closed for ID:', self.id);
            if(self.close_callback) {
                self.close_callback();
            }
            delete self._server._connections[self.id];
        });

        this._connection.on('error', function(err) {
            console.error('WebSocket error for connection ID:', self.id, err);
        });
    },
    
    send: function(message) {
        var data;
        if(useBison) {
            data = BISON.encode(message);
        } else {
            data = JSON.stringify(message);
        }
        console.log('Sending message to connection ID:', this.id, 'Message:', data);
        this.sendUTF8(data);
    },
    
    sendUTF8: function(data) {
        this._connection.send(data);
    }
});
