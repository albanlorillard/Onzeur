var P2Pconfig = require('../config');

var io = require( 'socket.io-client' );
var logger = require ('../logger');
var peerFunctions = require ('./peerFunctions');
var peerManager = require('./peerManager'); // ConnectionHandle.

function peerClient(ipDest, myId) {
    this.ip = ipDest;
    this.fromIp =  myId.addr;

    /* CREATION A P2P CLIENT */
        // On Connect
    var socketCl = io.connect("http://"+ipDest, {reconnect:true});
    this.socket = socketCl;

    socketCl.on('connect', function (data) {
        logger.silly("[PeerClient] Connection to "+ to + " ... OK !");
        peerFunctions.setPeer(to, socketCl.id, "client", socketCl);

        //Searching new peers....
        var ping = {from:myId.addr, to:"", subject:"ping", message:{addr:myId.addr, pseudo:myId.pseudo, id: socketCl.id}, maxTTL:P2Pconfig.maxTTL, currentTTL:1, road:[]};
        logger.silly("[PING "+ping.currentTTL+"/"+ping.maxTTL+"] : "+ping.message.pseudo);
        socketCl.emit("Ping", ping);

        //peerFunctions.ping(myId,ping,ioS,socketCl);
    });

    socketCl.on('disconnect', function (data) {
        peerFunctions.unsetPeerURI(socketCl.io.uri);
        logger.silly("[PeerClient] A server disconnects ");
    });

    socketCl.on('Ping', function(data)
    {
        logger.silly("[PING] Reçu ! FROM "+data.from.pseudo);
        logger.silly("[PING "+data.currentTTL+"/"+data.maxTTL+"] : "+data.message.pseudo);
        logger.silly("[PING] Envoie pong");

        var pong = {from:myId.addr, to:data.from, subject:"pong", message:myId.addr, maxTTL:data.maxTTL, currentTTL:data.currentTTL--, road:data.road};
        logger.silly("[PONG "+pong.currentTTL+"/"+pong.maxTTL+"] : dest final: "+ pong.from);
        socketCl.emit('Pong', pong); // send pong to my client

    });

    socketCl.on('Pong', function(data)
    {
        logger.silly("[PONG "+data.currentTTL+"/"+data.maxTTL+"] : REçU de "+ data.from + " dest : "+data.to);
        logger.silly("[PONG] Reçu avec le message : "+ data.message);

        if (data.to == myId.addr)
        {
            logger.silly("[PONG] Ce pong m'est destiné !");
            if (peerFunctions.getPeers().length < P2Pconfig.maxConnectionsPerPeer)
            {

                if (!peerFunctions.peerAlreadyConnected(data.message))
                {
                    var newConnection = new peerClient(data.message,myId);
                    //peerFunctions.setPeer(data.message, newConnection.id, "client");
                }
                else
                {
                    logger.silly("[PONG] Déjà connecté à lui.");
                }
            }
            else
            {
                logger.silly("[PONG] Too Many Connection : "+ P2Pconfig.maxConnectionsPerPeer);
            }
        }

//        peerFunctions.pong(myId,data,ioS, socketCl);
    });

}
// class methods
peerClient.prototype.getSocket = function() {
    return this.socket;
};

peerClient.prototype.getIp = function() {
    return this.fromIp;
};

// export the class
module.exports = peerClient;