var logger = require('../logger');
var P2Pconfig = require('../config');
var peers = [];
var peerFunctions = require ('./peerFunctions');

function peerServer(httpServer, myId) {
    this.server = httpServer;
    /*** CREATION OF A P2P SERVER ***/
    var io = require('socket.io').listen(this.server);        // this is the socket.io server
    this.io = io;

    io.maxConnectionsPerPeer = P2Pconfig.maxConnectionsPerPeer-1;
    io.sockets.on("connection", function (socket) {

        //record his sessionsID if possible.
        if (peers.length == peerFunctions.maxConnectionsPerPeer)
        {
            logger.silly('[PeerServer] Sorry client, too many connections !');
            socket.emit('disconnect', 'I\'m sorry, too many connections');
            socket.disconnect();
        }
        else
        {
            logger.silly('[PeerServer] New client connected !');
            peerFunctions.setPeer(socket.request.connection.remoteAddress+":"+socket.request.connection.remotePort, socket.id, "server", socket);
        }

        socket.on("Ping", function(data)
        {
            logger.silly("[PING] Reçu FROM "+ data.from.pseudo);

            peerFunctions.ping(myId,data,httpServer, io,socket);
            //data.currentTTL--;
        });

        socket.on("Pong", function(data)
        {
            logger.silly("[PONG] Reçu FROM "+ data.from.pseudo);
            if (data.to == myId.addr)
            {
                // IT'S FOR ME !
                logger.silly("[PONG] Ce pong est pour moi!");
                logger.silly("[PONG] TTL:"+data.currentTTL + "/"+data.maxTTL+". From:"+data.from+" to:"+data.to+" subject:"+data.subject+ "message:"+data.message );
            }
            else
            {
                var nextNode = data.road[data.road.length-1].socketId;
                data.road.pop();
                var pong = {from:data.from, to:data.to, subject:data.subject, message:data.message, maxTTL:data.maxTTL, currentTTL:data.currentTTL--, road:data.road};
                //peerFunctions.getPeer(nextNode).socket.emit("Pong", pong);
                socket.broadcast.to(nextNode).emit('Pong', pong);


                //nextNode.socket.emit('Ping', ping);
            }
        });

        socket.on("disconnect", function () {
            peerFunctions.unsetPeer(socket.id);
            logger.silly("[PeerServer] A client disconnects ");
        });
    });
}

peerServer.prototype.getIO = function() {
    return this.io;
};

module.exports = peerServer;